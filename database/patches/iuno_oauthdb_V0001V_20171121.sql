--#######################################################################################################
--TRUMPF Werkzeugmaschinen GmbH & Co KG
--TEMPLATE FOR DATABASE PATCHES, HOT FIXES and SCHEMA CHANGES
--Author: Marcel Ely Gomes
--CreateAt: 2017-11-21
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
--	At the moment the GetRefreshToken function is missing
-- 	2) Which Git Issue Number is this patch solving? 
--	#37
-- 	3) Which changes are going to be done? 
--	Create the function GetRefreshToken
--: Run Patches
------------------------------------------------------------------------------------------------
--##############################################################################################
-- Write into the patch table: patchname, patchnumber, patchdescription and start time
--##############################################################################################
DO
$$
	DECLARE
		PatchName varchar		 	 := 'iuno_oauthdb_V0001V_20171121';
		PatchNumber int 		 	 := 0001;
		PatchDescription varchar 	 := 'Create GetRefreshToken function';
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
			vPatchNumber int := 0001;
		BEGIN
	----------------------------------------------------------------------------------------------------------------------------------------
			
CREATE OR REPLACE FUNCTION public.getrefreshtoken(IN vrefreshtoken character varying)
  RETURNS TABLE("refreshToken" character varying, "refreshTokenExpiresAt" timestamp with time zone, scope uuid, client uuid, "user" uuid, createdat timestamp with time zone) AS
$BODY$
		select	rt.refreshtoken,
			rt.expires at time zone 'utc',
			sc.scopeuuid,
			cl.clientuuid,
			us.useruuid,
			rt.createdat at time zone 'utc'
		from refreshtokens rt
		join clients cl on rt.clientid = cl.clientid
		join users us on rt.userid = us.userid
		left outer join scopes sc on rt.scopeid = sc.scopeid
		where rt.refreshtoken = vrefreshtoken;
	$BODY$
  LANGUAGE sql; 
			
	----------------------------------------------------------------------------------------------------------------------------------------
		-- UPDATE patch table status value
		UPDATE patches SET status = 'OK', endat = now() WHERE patchnumber = vPatchNumber;
		--ERROR HANDLING
		EXCEPTION WHEN OTHERS THEN
			UPDATE patches SET status = 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || 'while creating patch.'	WHERE patchnumber = vPatchNumber;	 
		 RETURN;
	END;
$$; 