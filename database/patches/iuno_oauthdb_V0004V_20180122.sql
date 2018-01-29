--#######################################################################################################
--TRUMPF Werkzeugmaschinen GmbH & Co KG
--TEMPLATE FOR DATABASE PATCHES, HOT FIXES and SCHEMA CHANGES
--Author: Manuel Beuttler
--CreateAt: 2018-01-22
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
		PatchName varchar		 	 := 'iuno_oauthdb_V0004V_20180122';
		PatchNumber int 		 	 := 0004;
		PatchDescription varchar 	 := 'Added new field to user table - Created new table for email verification keys - Added new function to generate registration key - Updated user functions to return verified flag #26';
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
			vPatchNumber int := 0004;
		BEGIN
	----------------------------------------------------------------------------------------------------------------------------------------
    CREATE
    TABLE RegistrationKeys
    (
        RegistrationKeyID   INTEGER NOT NULL ,
        RegistrationKey     UUID NOT NULL ,
        Expires             timestamp without time zone NOT NULL ,
        UserID              INTEGER NOT NULL ,
        CreatedAt           timestamp without time zone NOT NULL
    );
    ALTER TABLE RegistrationKeys ADD CONSTRAINT RegistrationKeys_PK PRIMARY KEY (RegistrationKeyID );
    ALTER TABLE RegistrationKeys ADD CONSTRAINT RegistrationKeys__UN UNIQUE ( RegistrationKey );

    ALTER TABLE RegistrationKeys ADD CONSTRAINT RegistrationKeys_Users_FK FOREIGN KEY (UserID ) REFERENCES Users ( UserID ) ON DELETE NO ACTION ;

    CREATE SEQUENCE RegistrationKeyID START 1;

    ----------------------------------------------------------------------------------------------------------------------------------------

    ALTER TABLE Users ADD COLUMN isVerified BOOLEAN;

    ----------------------------------------------------------------------------------------------------------------------------------------

    DROP FUNCTION public.getuser(character varying, character varying);

    CREATE OR REPLACE FUNCTION public.getuser(
        vuseremail character varying,
        vuserpwd character varying)
        RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean, createdat timestamp with time zone, updatedat timestamp with time zone)
    AS $BODY$

        SELECT  useruuid,
            externalid,
            firstname,
            lastname,
            useremail,
            array_agg(rl.rolename)::text[],
            oauth2provider,
            thumbnail,
            imgpath,
            isVerified,
            createdat at time zone 'utc',
            updatedat at time zone 'utc'
            from users us
            join usersroles ur on us.userid = ur.userid
            join roles rl on rl.roleid = ur.roleid
            where us.useremail = vuseremail
            and us.userpwd = (crypt(vUserPwd,us.userpwd))
        group by
            useruuid,
            externalid,
            firstname,
            lastname,
            useremail,
            oauth2provider,
            thumbnail,
            imgpath,
            isVerified,
            createdat,
            updatedat

    $BODY$
    LANGUAGE 'sql';
	----------------------------------------------------------------------------------------------------------------------------------------
    DROP FUNCTION public.getuserbyid(uuid);

    CREATE OR REPLACE FUNCTION public.getuserbyid(
    	vuseruuid uuid)
        RETURNS TABLE(id uuid, externalid character varying, username character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean, createdat timestamp with time zone, updatedat timestamp with time zone)

    AS $BODY$

    	SELECT  useruuid,
    		externalid,
    		username,
    		firstname,
    		lastname,
    		useremail,
    		array_agg(rl.rolename)::text[],
    		oauth2provider,
    		thumbnail,
    		imgpath,
    		isVerified,
    		createdat at time zone 'utc',
    		updatedat at time zone 'utc'
    		 FROM Users us
    		join usersroles ur on us.userid = ur.userid
    		join roles rl on rl.roleid = ur.roleid
    		WHERE UserUUID = vUserUUID
    	group by
    		useruuid,
    		externalid,
    		username,
    		firstname,
    		lastname,
    		useremail,
    		oauth2provider,
    		thumbnail,
    		imgpath,
    		isVerified,
    		createdat,
    		updatedat;


    $BODY$
    LANGUAGE 'sql';

    ----------------------------------------------------------------------------------------------------------------------------------------

    DROP FUNCTION public.getuserfromclient(character varying);

    CREATE OR REPLACE FUNCTION public.getuserfromclient(
    	vclientuuid character varying)
        RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean, createdat timestamp with time zone, updatedat timestamp with time zone)

    AS $BODY$

    	SELECT  useruuid,
    		externalid,
    		firstname,
    		lastname,
    		useremail,
    		array_agg(rl.rolename)::text[],
    		oauth2provider,
    		thumbnail,
    		imgpath,
    		isVerified,
    		us.createdat at time zone 'utc',
    		us.updatedat at time zone 'utc'
    		from users us
    		join clients cl on cl.userid = us.userid
    		join usersroles ur on us.userid = ur.userid
    		join roles rl on rl.roleid = ur.roleid
    		where cl.clientuuid = vClientUUID::uuid
    	group by
    		useruuid,
    		externalid,
    		firstname,
    		lastname,
    		useremail,
    		oauth2provider,
    		thumbnail,
    		imgpath,
    		isVerified,
    		us.createdat,
    		us.updatedat;


    $BODY$
    LANGUAGE 'sql';

	----------------------------------------------------------------------------------------------------------------------------------------

	CREATE OR REPLACE FUNCTION public.createregistrationkey(
        	vuseruuid uuid)
            RETURNS TABLE(registrationkey uuid, expires timestamp with time zone)

        AS $BODY$

            DECLARE vRegistrationKeyID integer := (select nextval('RegistrationKeyID'));
			        vRegistrationKey uuid := (select uuid_generate_v4());
			        vUserID integer := (select userid from users where useruuid = vUserUUID);
        BEGIN
            INSERT INTO registrationkeys (registrationkeyid, registrationkey, expires, userid, createdat)
                VALUES(vRegistrationKeyID, vRegistrationKey, now() + interval '1 day', vUserID, now());

                RETURN QUERY (  select
                                registrationkeys.registrationkey,
                                registrationkeys.expires at time zone 'utc'
                                from registrationkeys where registrationkeys.registrationkey = vRegistrationKey);


                exception when others then
                RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateRegistrationKey';
              END;


        $BODY$
        LANGUAGE 'plpgsql';

	----------------------------------------------------------------------------------------------------------------------------------------

	CREATE OR REPLACE FUNCTION public.verifyuser(
            	vuseruuid uuid,
            	vregistrationkey uuid
            	)
                RETURNS boolean

        AS $BODY$

            DECLARE vUserID integer := (select userid from users where useruuid = vUserUUID);
                    vExpirationDate timestamp with time zone := (select expires from registrationkeys
                                                                where registrationkey = vRegistrationKey
                                                                AND userid = vUserID);
        BEGIN

            IF(vExpirationDate is not null AND vExpirationDate >= now()) THEN
                UPDATE users SET isVerified = true WHERE UserID = vUserID;
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