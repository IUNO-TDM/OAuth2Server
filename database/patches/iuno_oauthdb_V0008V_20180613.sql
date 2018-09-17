--#######################################################################################################
--TRUMPF Werkzeugmaschinen GmbH & Co KG
--TEMPLATE FOR DATABASE PATCHES, HOT FIXES and SCHEMA CHANGES
--Author: Marcel Ely Gomes
--CreateAt: 2018-06-13
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
--	Unused data is returned by then database. This is a security issue
-- 	2) Which Git Issue Number is this patch solving? 
--	#185 (MarketplaceCore)
-- 	3) Which changes are going to be done? 
--	Update functions to return only necessary data
--: Run Patches
------------------------------------------------------------------------------------------------
--##############################################################################################
-- Write into the patch table: patchname, patchnumber, patchdescription and start time
--##############################################################################################
DO
$$
	DECLARE
		PatchName varchar		 	 := 'iuno_oauthdb_V0008V_20180613';
		PatchNumber int 		 	 := 0008;
		PatchDescription varchar 	 := 'Update functions to return only necessary data';
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
			vPatchNumber int := 0008;
		BEGIN
	----------------------------------------------------------------------------------------------------------------------------------------

     DROP FUNCTION public.createrole(character varying, character varying);
     DROP FUNCTION public.createuser(character varying, character varying, character varying, character varying, character varying, character varying, character varying, bytea);
     DROP FUNCTION public.createuser(character varying, character varying, character varying, character varying, character varying, character varying, character varying, bytea, character varying);
     DROP FUNCTION public.getuser(character varying, character varying);
     DROP FUNCTION public.getuserbyexternalid(character varying, character varying);
     DROP FUNCTION public.getuserbyid(uuid);
     DROP FUNCTION public.getuserfromclient(character varying);
     DROP FUNCTION public.setuser(character varying, character varying, character varying, character varying, character varying, character varying, character varying, bytea, text[], character varying);

      CREATE OR REPLACE FUNCTION public.createrole(
     	vrolename character varying,
     	vroledescription character varying)
         RETURNS TABLE(roleuuid uuid, rolename character varying, roledescription character varying)
         LANGUAGE 'plpgsql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

     		#variable_conflict use_column
     		DECLARE vRoleID integer := (select nextval('RoleID'));
     				vRoleUUID uuid := (select uuid_generate_v4());
     			BEGIN
     				INSERT INTO roles (roleid,roleuuid,rolename,roledescription)
     				VALUES(vRoleID,vRoleUUID,vrolename,vroledescription);

     			-- Begin Log if success
             perform public.createlog(0,'Created Role sucessfully', 'CreateRole',
                                     'RoleName: ' || vRoleName ||
     								', RoleDescription: ' || vroledescription);

     		-- RETURN
     		RETURN QUERY (select 	roles.roleuuid,
     				roles.rolename,
     				roles.roledescription
     			from roles where roles.roleuuid = vRoleUUID);

     		exception when others then
             -- Begin Log if error
             perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateRole',
                                     'RoleName: ' || vRoleName ||
     								', RoleDescription: ' || vroledescription);

     		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUsersRoles';
             -- End Log if error

     			END;

     $BODY$;

     CREATE OR REPLACE FUNCTION public.createuser(
     	vexternalid character varying,
     	vusername character varying,
     	vfirstname character varying,
     	vlastname character varying,
     	vuseremail character varying,
     	voauth2provider character varying,
     	vimgpath character varying,
     	vthumbnail bytea)
         RETURNS TABLE(id uuid)
         LANGUAGE 'plpgsql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

     		#variable_conflict use_column
     		DECLARE vUserID integer := (select nextval('UserID'));
     				vUserUUID uuid := (select uuid_generate_v4());
           BEGIN
     		INSERT INTO users (userid,externalid,useruuid,username,firstname,lastname,useremail,oauth2provider,createdat,imgpath,thumbnail)
     		VALUES(vUserID,vexternalid,vUserUUID,vusername,vfirstname,vlastname,vuseremail,voauth2provider,now(),vimgpath,vthumbnail);

     		-- Begin Log if success
             perform public.createlog(0,'Created User sucessfully', 'CreateUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);

     		-- RETURN
     		RETURN QUERY (select 	users.useruuid
     			from users where users.useruuid = vUserUUID);

             exception when others then
             -- Begin Log if error
             perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);
     		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUser';
             -- End Log if error
           END;

     $BODY$;

     CREATE OR REPLACE FUNCTION public.createuser(
     	vexternalid character varying,
     	vusername character varying,
     	vfirstname character varying,
     	vlastname character varying,
     	vuseremail character varying,
     	voauth2provider character varying,
     	vimgpath character varying,
     	vthumbnail bytea,
     	vuserpwd character varying)
         RETURNS TABLE(useruuid uuid)
         LANGUAGE 'plpgsql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

     		#variable_conflict use_column
     		DECLARE vUserID integer := (select nextval('UserID'));
     			vUserUUID uuid := (select uuid_generate_v4());
     			vUserPwd varchar := (select crypt(vUserPwd, gen_salt('bf')));
           BEGIN
     		INSERT INTO users (userid,externalid,useruuid,username,firstname,lastname,useremail,oauth2provider,createdat,imgpath,thumbnail, userPwd)
     		VALUES(vUserID,vexternalid,vUserUUID,vusername,vfirstname,vlastname,vuseremail,voauth2provider,now(),vimgpath,vthumbnail, vUserPWD);

     		-- Begin Log if success
             perform public.createlog(0,'Created User sucessfully', 'CreateUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);

     		-- RETURN
     		RETURN QUERY (select 	users.useruuid
     			from users where users.useruuid = vUserUUID);

             exception when others then
             -- Begin Log if error
             perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);
     		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUser';
             -- End Log if error
           END;


     $BODY$;

     CREATE OR REPLACE FUNCTION public.getuser(
     	vuseremail character varying,
     	vuserpwd character varying)
         RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean)
         LANGUAGE 'sql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

             SELECT  useruuid,
                 externalid,
                 firstname,
                 lastname,
                 array_agg(rl.rolename)::text[],
                 oauth2provider,
                 thumbnail,
                 imgpath,
                 isVerified
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
                 oauth2provider,
                 thumbnail,
                 imgpath,
                 isVerified
     $BODY$;


     CREATE OR REPLACE FUNCTION public.getuserbyexternalid(
     	vexternalid character varying,
     	voauth2provider character varying)
         RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying)
         LANGUAGE 'sql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

     	SELECT  useruuid,
     		externalid,
     		firstname,
     		lastname,
     		array_agg(rl.rolename)::text[],
     		oauth2provider,
     		thumbnail,
     		imgpath
     		from users us
     		join usersroles ur on us.userid = ur.userid
     		join roles rl on rl.roleid = ur.roleid
     		where us.externalid = vExternalID
     		and us.oauth2provider = vOauth2Provider
     	group by
     		useruuid,
     		externalid,
     		firstname,
     		lastname,
     		oauth2provider,
     		thumbnail,
     		imgpath
     $BODY$;

     CREATE OR REPLACE FUNCTION public.getuserbyid(
     	vuseruuid uuid)
         RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean)
         LANGUAGE 'sql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

         	SELECT  useruuid,
         		externalid,
         		firstname,
         		lastname,
         		array_agg(rl.rolename)::text[],
         		oauth2provider,
         		thumbnail,
         		imgpath,
         		isVerified
         		 FROM Users us
         		join usersroles ur on us.userid = ur.userid
         		join roles rl on rl.roleid = ur.roleid
         		WHERE UserUUID = vUserUUID
         	group by
         		useruuid,
         		externalid,
         		firstname,
         		lastname,
         		oauth2provider,
         		thumbnail,
         		imgpath,
         		isVerified
     $BODY$;


     CREATE OR REPLACE FUNCTION public.getuserfromclient(
     	vclientuuid character varying)
         RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, "isVerified" boolean)
         LANGUAGE 'sql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

         	SELECT  useruuid,
         		externalid,
         		firstname,
         		lastname,
         		array_agg(rl.rolename)::text[],
         		oauth2provider,
         		thumbnail,
         		imgpath,
         		isVerified
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
         		oauth2provider,
         		thumbnail,
         		imgpath,
         		isVerified
     $BODY$;


     CREATE OR REPLACE FUNCTION public.setuser(
     	vexternalid character varying,
     	vusername character varying,
     	vfirstname character varying,
     	vlastname character varying,
     	vuseremail character varying,
     	voauth2provider character varying,
     	vimgpath character varying,
     	vthumbnail bytea,
     	vuserroles text[],
     	vuserpwd character varying)
         RETURNS TABLE(id uuid)
         LANGUAGE 'plpgsql'

         COST 100
         VOLATILE
         ROWS 1000
     AS $BODY$

     		#variable_conflict use_column
     		DECLARE vUserID integer := (select nextval('UserID'));
     			vUserUUID uuid := (select uuid_generate_v4());
     			vUserPwd varchar := (select crypt(vUserPwd, gen_salt('bf')));
     			vRoleName text;
     			vRoleUUID uuid;
           BEGIN
     		INSERT INTO users (userid,externalid,useruuid,username,firstname,lastname,useremail,oauth2provider,createdat,imgpath,thumbnail, userPwd)
     		VALUES(vUserID,vexternalid,vUserUUID,vusername,vfirstname,vlastname,lower(vuseremail),voauth2provider,now(),vimgpath,vthumbnail, vUserPWD);

     		FOREACH vRoleName in array vUserRoles
     		LOOP
     			 if not exists (select rolename from roles where rolename = vRoleName) then
     			 raise exception using
     			 errcode = 'invalid_parameter_value',
     			 message = 'There is no rolename with RoleName: ' || vRoleName;
     			 else
     				vRoleUUID := (select roleuuid from roles where rolename = vRoleName);
     				perform createusersroles(vUserUUID, vRoleUUID);
     			 end if;
     		END LOOP;

     		-- Begin Log if success
             perform public.createlog(0,'Created User sucessfully', 'SetUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);

     		-- RETURN
     		RETURN QUERY (select 	users.useruuid
     			from users where users.useruuid = vUserUUID);

             exception when others then
             -- Begin Log if error
             perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'SetUser',
                                     'UserID: ' || cast(vUserID as varchar) || ', UserFirstName: '
                                     || vfirstname || ', UserLastName: ' || vlastname
                                     || ', '
                                     || vuseremail);
     		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUser';
             -- End Log if error
           END;


     $BODY$;

    ----------------------------------------------------------------------------------------------------------------------------------------
    -- UPDATE patch table status value
    UPDATE patches SET status = 'OK', endat = now() WHERE patchnumber = vPatchNumber;
    --ERROR HANDLING
    EXCEPTION WHEN OTHERS THEN
        UPDATE patches SET status = 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || 'while creating patch.'	WHERE patchnumber = vPatchNumber;
     RETURN;
END;
$$; 