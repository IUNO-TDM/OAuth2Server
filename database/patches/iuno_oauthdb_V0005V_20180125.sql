--#######################################################################################################
--TRUMPF Werkzeugmaschinen GmbH & Co KG
--TEMPLATE FOR DATABASE PATCHES, HOT FIXES and SCHEMA CHANGES
--Author: Manuel Beuttler
--CreateAt: 2018-01-25
--Version: 00.00.01 (Initial)
--#######################################################################################################
-- READ THE INSTRUCTIONS BEFORE CONTINUE - USE ONLY PatchDBTool to deploy patches to existing Databases
-- Describe your patch here
-- Patch Description: 
-- 	1) Why is this Patch necessary?
-- 	2) Which Git Issue Number is this patch solving?
-- 	3) Which changes are going to be done?
-- PATCH FILE NAME - THIS IS MANDATORY
-- iuno_<databasename>_V<patchnumber>V_<creation date>.sql
-- PatchNumber Format: 00000 whereas each new Patch increase the patchnumber by 1
-- Example: iuno_marketplacecore_V00001V_20170913.sql
--#######################################################################################################
-- PUT YOUR STATEMENTS HERE:
-- 	1) Why is this Patch necessary? 
--	The function CreateAuthorization Code does not work.
-- 	2) Which Git Issue Number is this patch solving? 
--	#43
-- 	3) Which changes are going to be done? 
--	Correct Column name on select return value
--: Run Patches
------------------------------------------------------------------------------------------------
--##############################################################################################
-- Write into the patch table: patchname, patchnumber, patchdescription and start time
--##############################################################################################
DO
$$
	DECLARE
		PatchName varchar		 	 := 'iuno_oauthdb_V0005V_20180125';
		PatchNumber int 		 	 := 0005;
		PatchDescription varchar 	 := 'New tables and functions for resetting the user password';
		CurrentPatch int 			 := (select max(p.patchnumber) from patches p);

	BEGIN	
		--INSERT START VALUES TO THE PATCH TABLE
		IF (PatchNumber <= CurrentPatch) THEN
			RAISE EXCEPTION '%', 'Wrong patch number. Please verify your patches!';
		ELSE
			INSERT INTO PATCHES (patchname, patchnumber, patchdescription, startat) VALUES (PatchName, PatchNumber, PatchDescription, now());		
		END IF;	
	END;
$$;
------------------------------------------------------------------------------------------------
--##############################################################################################
-- Run the patch itself and update patches table
--##############################################################################################
DO
$$
		DECLARE
			vPatchNumber int := 0005;
		BEGIN
	----------------------------------------------------------------------------------------------------------------------------------------
    CREATE
    TABLE PasswordKeys
    (
        PasswordKeyID       INTEGER NOT NULL ,
        PasswordKey         UUID NOT NULL ,
        Expires             timestamp without time zone NOT NULL ,
        Used                boolean,
        UserID              INTEGER NOT NULL ,
        CreatedAt           timestamp without time zone NOT NULL,
        UpdatedAt           timestamp without time zone
    );
    ALTER TABLE PasswordKeys ADD CONSTRAINT PasswordKeys_PK PRIMARY KEY (PasswordKeyID );
    ALTER TABLE PasswordKeys ADD CONSTRAINT PasswordKeys__UN UNIQUE ( PasswordKey );

    ALTER TABLE PasswordKeys ADD CONSTRAINT PasswordKeys_Users_FK FOREIGN KEY (UserID ) REFERENCES Users ( UserID ) ON DELETE NO ACTION ;

    CREATE SEQUENCE PasswordKeyID START 1;

	----------------------------------------------------------------------------------------------------------------------------------------

	CREATE OR REPLACE FUNCTION public.createpasswordkey(
        	vuseremail character varying)
            RETURNS TABLE(passwordkey uuid, expires timestamp with time zone)

        AS $BODY$

            DECLARE vPasswordKeyID integer := (select nextval('PasswordKeyID'));
			        vPasswordKey uuid := (select uuid_generate_v4());
			        vUserID integer := (select userid from users where useremail = vUserEmail);
        BEGIN
            INSERT INTO passwordkeys (passwordkeyid, passwordkey, expires, used, userid, createdat)
                VALUES(vPasswordKeyID, vPasswordKey, now() + interval '1 hour', false, vUserID, now());

                RETURN QUERY (  select
                                passwordkeys.passwordkey,
                                passwordkeys.expires at time zone 'utc'
                                from passwordkeys where passwordkeys.passwordkey = vPasswordKey);


                exception when others then
                RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreatePasswordKey';
              END;


        $BODY$
        LANGUAGE 'plpgsql';

	----------------------------------------------------------------------------------------------------------------------------------------

	CREATE OR REPLACE FUNCTION public.resetpassword(
            	vuseremail character varying,
            	vpasswordkey uuid,
            	vpassword character varying
            	)
                RETURNS boolean

        AS $BODY$

            DECLARE vUserID integer := (select userid from users where useremail = vuseremail);
                    vExpirationDate timestamp with time zone := (select expires from passwordkeys
                                                                where passwordkey = vPasswordKey
                                                                AND userid = vUserID
                                                                AND used = false);
                    vPassword varchar := (select crypt(vPassword, gen_salt('bf')));
        BEGIN

            IF(vExpirationDate is not null AND vExpirationDate >= now()) THEN
                UPDATE users SET userpwd = vPassword, updatedat = now() WHERE UserID = vUserID;
                UPDATE passwordkeys SET used = true, updatedat = now() WHERE passwordkey = vPasswordKey;
                RETURN true;
            ELSE RETURN false;
            END IF;

        END;
        $BODY$
    LANGUAGE 'plpgsql';

    ----------------------------------------------------------------------------------------------------------------------------------------
		-- UPDATE patch table status value
		UPDATE patches SET status = 'OK', endat = now() WHERE patchnumber = vPatchNumber;
		--ERROR HANDLING
		EXCEPTION WHEN OTHERS THEN
			UPDATE patches SET status = 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || 'while creating patch.'	WHERE patchnumber = vPatchNumber;	 
		 RETURN;
	END;
$$; 