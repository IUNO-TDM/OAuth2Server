--#######################################################################################################
--TRUMPF Werkzeugmaschinen GmbH & Co KG
--TEMPLATE FOR DATABASE PATCHES, HOT FIXES and SCHEMA CHANGES
--Author: Marcel Ely Gomes
--CreateAt: 2018-01-11
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
		PatchName varchar		 	 := 'iuno_oauthdb_V0003V_20180111';
		PatchNumber int 		 	 := 0003;
		PatchDescription varchar 	 := 'Correct Column name on select return value in function CreateAuthorizationCode';
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
			vPatchNumber int := 0003;
		BEGIN
	----------------------------------------------------------------------------------------------------------------------------------------
   DROP FUNCTION public.createauthorizationcode(character varying, timestamp without time zone, character varying, uuid, uuid);

   CREATE OR REPLACE FUNCTION public.createauthorizationcode(
    IN vauthorizationcode character varying,
    IN vexpires timestamp without time zone,
    IN vredirecturi character varying,
    IN vclientuuid uuid,
    IN vuseruuid uuid)
      RETURNS TABLE("authorizationCode" character varying, "expiresAt" timestamp with time zone, redirecturi character varying, clientuuid uuid, "user" uuid, createdat timestamp with time zone) AS
    $BODY$
          #variable_conflict use_column
           DECLARE 	vAuthorizationCodeID integer := (select nextval('AuthorizationCodeID'));
                    --vAuthorizationCode varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-',''));
                    vUserID integer := (select userid from users where useruuid = vuseruuid);
                    vClientID integer := (select clientid from clients where clientuuid = vclientuuid);
           BEGIN
          INSERT INTO authorizationcodes (authorizationcodeid,authorizationcode,expires,redirecturi,clientid,userid,createdat)
           VALUES(vauthorizationcodeid,vAuthorizationCode,vexpires,vredirecturi,vClientID,vUserID,now());

           -- Begin Log if success
            perform public.createlog(0,'Created AuthorisationCode sucessfully', 'createauthorizationcode',
                                    'Expires: ' || cast(vexpires as varchar) ||
                                    ', RedirectURI: ' || vredirecturi ||
                                    ', ClientID: ' || cast(vClientID as varchar) ||
                                    ', UserID: ' || cast(vUserID as varchar));

            RETURN QUERY (
                select 	AuthorizationCode,
                        Expires at time zone 'utc',
                        RedirectURI,
                        vClientUUID as ClientUUID,
                        vUserUUID as UserUUID,
                        CreatedAt at time zone 'utc'
                from authorizationcodes where authorizationcodeid = vAuthorizationCodeID);


            exception when others then
            -- Begin Log if error
            perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,'createauthorizationcode',
                                    'Expires: ' || cast(vexpires as varchar) ||
                                    ', RedirectURI: ' || vredirecturi ||
                                    ', ClientID: ' || cast(vClientID as varchar) ||
                                    ', UserID: ' || cast(vUserID as varchar));

            RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createauthorizationcode';
            -- End Log if error

          END;
      $BODY$
      LANGUAGE plpgsql;
			
	----------------------------------------------------------------------------------------------------------------------------------------
		-- UPDATE patch table status value
		UPDATE patches SET status = 'OK', endat = now() WHERE patchnumber = vPatchNumber;
		--ERROR HANDLING
		EXCEPTION WHEN OTHERS THEN
			UPDATE patches SET status = 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || 'while creating patch.'	WHERE patchnumber = vPatchNumber;	 
		 RETURN;
	END;
$$; 