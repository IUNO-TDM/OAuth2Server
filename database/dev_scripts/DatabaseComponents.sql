-- ##########################################################################
-- Author: Marcel Ely Gomes
-- Company: Trumpf Werkzeugmaschine GmbH & Co KG
-- CreatedAt: 2017-06-28
-- Description: Script to create OAuthDB database functions, sequences, etc.
-- Changes:
-- ##########################################################################
-- Create Database
/*CREATE DATABASE "Test"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;*/
-- Install Extension UUID-OSSP
CREATE EXTENSION "uuid-ossp";
-- Install Extension dblink
CREATE EXTENSION "dblink";
-- Install crypto
create extension "pgcrypto";
-- Create Sequences
-- UserID
CREATE SEQUENCE UserID START 1;
-- LogID
CREATE SEQUENCE LogID START 1;
-- RoleID
CREATE SEQUENCE RoleID START 1;
-- AccessTokenID
CREATE SEQUENCE AccessTokenID START 1;
-- RefreshID
CREATE SEQUENCE RefreshID START 1;
-- ClientID
CREATE SEQUENCE ClientID START 1;
-- ScopeID
CREATE SEQUENCE ScopeID START 1;
-- AuthorizationCodeID
CREATE SEQUENCE AuthorizationCodeID START 1;
-- ##########################################################################
--CreateUser
CREATE FUNCTION createuser(vexternalid character varying,
							vusername character varying,
							vfirstname character varying,
						    vlastname character varying,
							vuseremail character varying,
							voauth2provider character varying,
							vimgpath character varying,
							vthumbnail bytea)
     RETURNS TABLE (
	id uuid,
	UserFirstName varchar(250),
	UserLastName varchar(250),
	UserEmail varchar(250),
	CreatedAt timestamp with time zone,
	UpdatedAt timestamp with time zone
  )
	 AS
  $BODY$
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
		RETURN QUERY (select 	users.useruuid,
				users.firstname,
				users.lastname,
				users.useremail,
				users.createdat at time zone 'utc',
				users.updatedat at time zone 'utc'
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
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
--CreateUserRoles
CREATE FUNCTION createusersroles(vuseruuid uuid, vroleuuid uuid)
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE	vUserID integer := (select userid from users where useruuid = vuseruuid);
				vRoleID integer :=(select roleid from roles where roleuuid = vRoleUUID);
		BEGIN
			INSERT INTO usersroles (userid,roleid)
			VALUES(vUserID,vRoleID);

		-- Begin Log if success
        perform public.createlog(0,'Created UsersRoles sucessfully', 'CreateUsersRoles',
                                'UserID: ' || cast(vUserID as varchar) ||
								', RoleID: ' || cast(vRoleID as varchar));

		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateUsersRoles',
                                'UserID: ' || cast(vUserID as varchar) ||
								', RoleID: ' || cast(vRoleID as varchar));

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUsersRoles';
        -- End Log if error
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateRoles
CREATE FUNCTION createrole(vrolename character varying, vroledescription character varying)
     RETURNS TABLE (
	 roleuuid uuid,
	 rolename character varying,
	 roledescription character varying
	 )
	 AS
  $BODY$
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
				roles.roledescription --,
				--roles.createdat at time zone 'utc',
				--roles.updatedat at time zone 'utc'
			from roles where roles.roleuuid = vRoleUUID);

		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateRole',
                                'RoleName: ' || vRoleName ||
								', RoleDescription: ' || vroledescription);

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUsersRoles';
        -- End Log if error

			END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- saveToken
CREATE FUNCTION public.savetoken(
    IN vaccesstoken character varying,
    IN vexpiresacctoken timestamp without time zone,
    IN vrefreshtoken character varying,
    IN vexpiresreftoken timestamp without time zone,
    IN vscopeuuid uuid,
    IN vclientuuid uuid,
    IN vuseruuid uuid)
  RETURNS TABLE("accessToken" character varying, "accessTokenExpiresAt" timestamp with time zone, "refreshToken" character varying, "refreshTokenExpiresAt" timestamp with time zone, scope uuid, client uuid, "user" uuid, createdat timestamp with time zone) AS
$BODY$
	  #variable_conflict use_column
      DECLARE 	vAccessTokenID integer := (select nextval('AccessTokenID'));
				--vAccessToken varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-',''));
				vUserID integer := (select userid from users where useruuid = vuseruuid);
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid);
		BEGIN
			INSERT INTO accesstokens (accesstokenid,accesstoken,expires,scopeid,clientid,userid,createdat)
			VALUES(vAccessTokenID,vAccessToken,vexpiresAccToken,vScopeID,vclientid,vUserID,now());

			-- Begin Log if success
        perform public.createlog(0,'Created AccessToken sucessfully', 'saveToken',
                                'Expires: ' || cast(vexpiresAccToken as varchar) ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));
		if(vRefreshToken is not null and vexpiresRefToken is not null) then
			perform createRefreshToken(vRefreshToken, vexpiresRefToken, vscopeuuid, vclientuuid, vuseruuid);
		end if;


		-- RETURN
		RETURN QUERY (select    vAccessToken,
					vexpiresAccToken at time zone 'utc',
					vRefreshToken,
					vexpiresRefToken at time zone 'utc',
					vscopeuuid as scopeuuid,
					vclientuuid as clientuuid,
					vuseruuid as useruuid,
					ac.createdat at time zone 'utc'
			from accesstokens ac
			where accesstokenid = vAccessTokenID);

		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,  'saveToken',
                                'Expires: ' || cast(vexpiresAccToken as varchar) ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at saveToken';
        -- End Log if error

		END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
-- CreateRefreshTokens
CREATE FUNCTION public.createrefreshtoken(
    IN vRefreshToken character varying,
    IN vexpires timestamp without time zone,
    IN vscopeuuid uuid,
    IN vclientuuid uuid,
    IN vuseruuid uuid)
  RETURNS TABLE(refreshtoken character varying, expires timestamp with time zone, scopeuuid uuid, clientuuid uuid, useruuid uuid, createdat timestamp with time zone) AS
$BODY$
	  #variable_conflict use_column
      DECLARE 	vRefreshTokenID integer := (select nextval('RefreshID'));
		--vRefreshToken varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v4())::text,'-',''));
		vUserID integer := (select userid from users where useruuid = vuseruuid);
		vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
		vClientID integer := (select clientid from clients where clientuuid = vclientuuid);
	BEGIN
		INSERT INTO refreshtokens (refreshtokenid,RefreshToken,expires,scopeid,clientid,userid,createdat)
		VALUES(vRefreshTokenID,vRefreshToken,vexpires,vScopeID,vClientID,vUserID,now());

			-- Begin Log if success
        perform public.createlog(0,'Created RefreshToken sucessfully', 'createrefreshtoken',
                                'Expires: ' || cast(vexpires as varchar) ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));

		-- RETURN
		RETURN QUERY (select
					RefreshToken,
					Expires at time zone 'utc',
					vscopeuuid as scopeuuid,
					vclientuuid as clientuuid,
					vuseruuid as useruuid,
					createdat at time zone 'utc'
			from refreshtokens ac
			where refreshtokenid = vRefreshTokenID);

		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,  'createrefreshtoken',
                                'Expires: ' || cast(vexpires as varchar) ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createrefreshtoken';
        -- End Log if error

	END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
-- ##########################################################################
-- CreateScopes
CREATE FUNCTION createscope(visdefault boolean,vparameters character varying,vdescription character varying)
     RETURNS TABLE (
		ScopeUUID uuid,
		IsDefault boolean,
		Parameters character varying,
		Description character varying,
		CreatedAt timestamp with time zone
	 ) AS
  $BODY$
       #variable_conflict use_column
	   DECLARE 	vScopeID integer := (select nextval('ScopeID'));
				vScopeUUID uuid := (select uuid_generate_v4());
		BEGIN
      INSERT INTO scopes (scopeid,scopeuuid,isdefault,parameters,description,createdat)
       VALUES(vScopeID,vScopeUUID,visdefault,vparameters,vdescription,now());

	   	-- Begin Log if success
        perform public.createlog(0,'Created Scope sucessfully', 'createscope',
                                'IsDefault: ' || cast(vIsDefault as varchar) ||
								', vParameters: ' || vparameters ||
								', Description: ' || vdescription);

		-- RETURN
		RETURN QUERY (select
					ScopeUUID,
					IsDefault,
					Parameters,
					Description,
					createdat at time zone 'utc'
			from scopes
			where scopeid = vScopeID);

		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'createscope',
                                'IsDefault: ' || cast(vIsDefault as varchar) ||
								', vParameters: ' || vparameters ||
								', Description: ' || vdescription);

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createscope';
        -- End Log if error

      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateAuthorizationCode
CREATE FUNCTION createauthorizationcode(vAuthorizationCode character varying, vexpires timestamp without time zone,vredirecturi character varying,vclientuuid uuid,vuseruuid uuid)
     RETURNS TABLE (
		AuthorisationCode character varying,
		Expires timestamp with time zone,
		RedirectURI character varying,
		ClientUUID uuid,
		UserUUID uuid,
		CreatedAt timestamp with time zone
	 ) AS
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
			select 	AuthorisationCode,
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
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateLog
CREATE OR REPLACE FUNCTION public.createlog(
    vlogstatusid integer,
    vlogmessage character varying,
    vlogobjectname character varying,
    vparameters character varying)
  RETURNS void AS
$BODY$
      DECLARE vLogID integer:= (select nextval('LogID'));
	      vSqlCmd varchar := 'INSERT INTO LogTable(LogID, LogStatusID, LogMessage, LogObjectName, Parameters,CreatedAt)'
				 || 'VALUES( '
				 || cast(vLogID as varchar)
				 || ', ' || cast(vLogStatusID as varchar)
				 || ', ''' || vLogMessage
				 || ''', ''' || vLogObjectName
				 || ''', ''' || vParameters
				 || ''', ' || 'now())';
		 vConnName text := 'conn';
		 vConnString text := 'dbname=oauthdb port=5432 host=localhost user=oauthdb_loguser password=PASSWORD';
	      vConnExist bool := (select ('{' || vConnName || '}')::text[] <@ (select dblink_get_connections()));
      BEGIN

		if(not vConnExist or vConnExist is null) then
				perform dblink_connect(vConnName,vConnString);
		end if;
				perform dblink(vConnName,vSqlCmd);
				perform dblink_disconnect(vConnName);
				set role postgres;
      END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.createlog(integer, character varying, character varying, character varying)
  OWNER TO postgres;
-- ##########################################################################
--CreateScopeRoles
CREATE FUNCTION createscopesroles(vscopeuuid uuid, vroleuuid uuid)
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE	vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
				vRoleID integer :=(select roleid from roles where roleuuid = vRoleUUID);
		BEGIN
			INSERT INTO scopesroles (scopeid,roleid)
			VALUES(vScopeID,vRoleID);

		-- Begin Log if success
        perform public.createlog(0,'Created ScopesRoles sucessfully', 'createscopesroles',
                                'ScopeID: ' || cast(vscopeuuid as varchar) ||
								', RoleID: ' || cast(vroleid as varchar));



		exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,'createscopesroles',
                                'ScopeID: ' || cast(vscopeuuid as varchar) ||
								', RoleID: ' || cast(vroleid as varchar));

		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createscopesroles';
        -- End Log if error
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
--GetUserByExternalID
CREATE FUNCTION public.getuserbyexternalid(IN vexternalid character varying)
  RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
	SELECT  useruuid,
		externalid,
		firstname,
		lastname,
		useremail,
		array_agg(rl.rolename)::text[],
		oauth2provider,
		thumbnail,
		imgpath,
		createdat at time zone 'utc',
		updatedat at time zone 'utc'
		from users us
		join usersroles ur on us.userid = ur.userid
		join roles rl on rl.roleid = ur.roleid
		where us.externalid = vExternalID
	group by 
		useruuid,
		externalid,
		firstname,
		lastname,
		useremail,				
		oauth2provider,
		thumbnail,
		imgpath,
		createdat,
		updatedat;
		
	$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.getuserbyexternalid(character varying)
  OWNER TO postgres;
-- ##########################################################################
--GetClient
 CREATE FUNCTION public.getclient(
    IN vclientuuid uuid,
    IN vclientsecret character varying)
  RETURNS TABLE(id uuid, clientname character varying, redirecturis text[], grants text[], scope character varying) AS
$BODY$
		select 	clientUUID,
			clientName,
			redirectUris,
			grants,
			scopeuuid::varchar
		from clients cl
		left outer join scopes sc on cl.scopeid = sc.scopeid
		where clientuuid = vClientUUID::uuid
		and clientsecret = (crypt(vClientSecret,clientsecret))
	$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
--GetUserByID
CREATE FUNCTION public.getuserbyid(IN vuseruuid uuid)
  RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
	SELECT  useruuid,
		externalid,
		firstname,
		lastname,
		useremail,
		array_agg(rl.rolename)::text[],
		oauth2provider,
		thumbnail,
		imgpath,
		createdat at time zone 'utc',
		updatedat at time zone 'utc'
		 FROM Users us
		join usersroles ur on us.userid = ur.userid
		join roles rl on rl.roleid = ur.roleid
		WHERE UserUUID = vUserUUID
	group by 
		useruuid,
		externalid,
		firstname,
		lastname,
		useremail,				
		oauth2provider,
		thumbnail,
		imgpath,
		createdat,
		updatedat;
   
    $BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
--GetAccessToken
CREATE FUNCTION public.getaccesstoken(IN vaccesstoken character varying)
  RETURNS TABLE("accessToken" character varying, "accessTokenExpiresAt" timestamp with time zone, scope uuid, client uuid, "user" uuid, createdat timestamp with time zone) AS
$BODY$
		select	at.accesstoken,
			at.expires at time zone 'utc',
			sc.scopeuuid,
			cl.clientuuid,
			us.useruuid,
			at.createdat at time zone 'utc'
		from accesstokens at
		join clients cl on at.clientid = cl.clientid
		join users us on at.userid = us.userid
		left outer join scopes sc on at.scopeid = sc.scopeid
		where at.accesstoken = vaccesstoken;
	$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
--GetUser with pwd
CREATE FUNCTION public.getuser(
    IN vuseruuid character varying,
    IN vuserpwd character varying)
  RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
	SELECT  useruuid,
		externalid,
		firstname,
		lastname,
		useremail,
		array_agg(rl.rolename)::text[],
		oauth2provider,
		thumbnail,
		imgpath,
		createdat at time zone 'utc',
		updatedat at time zone 'utc'
		from users us
		join usersroles ur on us.userid = ur.userid
		join roles rl on rl.roleid = ur.roleid
		where us.useruuid = (vuseruuid)::uuid
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
		createdat,
		updatedat
	$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
--CreateUser with pwd
CREATE OR REPLACE FUNCTION public.createuser(
    IN vexternalid character varying,
    IN vusername character varying,
    IN vfirstname character varying,
    IN vlastname character varying,
    IN vuseremail character varying,
    IN voauth2provider character varying,
    IN vimgpath character varying,
    IN vthumbnail bytea,
    IN vUserPwd character varying)
  RETURNS TABLE(useruuid uuid, userfirstname character varying, userlastname character varying, useremail character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
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
		RETURN QUERY (select 	users.useruuid,
				users.firstname,
				users.lastname,
				users.useremail,
				users.createdat at time zone 'utc',
				users.updatedat at time zone 'utc'
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
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
--GetUserFromClient
CREATE OR REPLACE FUNCTION public.getuserfromclient(IN vclientuuid character varying)
  RETURNS TABLE(id uuid, externalid character varying, firstname character varying, lastname character varying, useremail character varying, roles text[], oauth2provider character varying, thumbnail bytea, imgpath character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
	SELECT  useruuid,
		externalid,
		firstname,
		lastname,
		useremail,
		array_agg(rl.rolename)::text[],
		oauth2provider,
		thumbnail,
		imgpath,
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
		us.createdat,
		us.updatedat;
		
	$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
CREATE FUNCTION public.createclient(
    IN vclientname character varying,
    IN vclientsecret character varying,
    IN vuseruuid uuid,
    IN vgrants text[],
    IN vredirecturis text[],
    IN vscopeuuid uuid)
  RETURNS TABLE(id uuid, clientname character varying, redirecturis text[], grants text[], scope character varying) AS
$BODY$
		#variable_conflict use_column
		DECLARE vClientID integer := (select nextval('UserID'));
			vClientUUID uuid := (select uuid_generate_v4());
			vClientPwd varchar := (select crypt(vClientSecret, gen_salt('bf')));
			vUserID integer := (select userid from users where useruuid = vUserUUID);
			vScopeID integer := (select scopeid from scopes where scopeuuid = vScopeUUID);
      BEGIN
		INSERT INTO clients (clientid, clientuuid, clientname, clientsecret, userid, createdat, grants, redirecturis, scopeid)
		VALUES(vClientID, vClientUUID, vClientName, vClientPwd, vUserID, now(), vGrants, vRedirectUris, vScopeID);

		-- Begin Log if success
        perform public.createlog(0,'Created Client sucessfully', 'CreateClient',
                                'ClientID: ' || cast(vClientID as varchar) || ', ClientName: '
                                || vClientName || ', Grants: ' || cast(vGrants as varchar)
                                || ', RedirectUris: ' || cast(vRedirectUris as varchar)
				|| ', ScopeID: ' || cast(vScopeID as varchar)
			);

		-- RETURN
		RETURN QUERY (	select 	clientUUID,
					clientName,
					redirectUris,
					grants,
					scopeuuid::varchar
				from clients cl
				left outer join scopes sc on cl.scopeid = sc.scopeid
				where clientuuid = vClientUUID
		);

        exception when others then
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE, 'CreateClient',
                                'ClientID: ' || cast(vClientID as varchar) || ', ClientName: '
                                || vClientName || ', Grants: ' || cast(vGrants as varchar)
                                || ', RedirectUris: ' || cast(vRedirectUris as varchar)
				|| ', ScopeID: ' || cast(vScopeID as varchar));

	RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at CreateUser';
        -- End Log if error
      END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
-- ##########################################################################
-- SetUser
CREATE FUNCTION SetUser(
    IN vexternalid character varying,
    IN vusername character varying,
    IN vfirstname character varying,
    IN vlastname character varying,
    IN vuseremail character varying,
    IN voauth2provider character varying,
    IN vimgpath character varying,
    IN vthumbnail bytea,
    IN vUserRoles text[],
    IN vuserpwd character varying)
RETURNS TABLE(id uuid, userfirstname character varying, userlastname character varying, useremail character varying, createdat timestamp with time zone, updatedat timestamp with time zone) AS
$BODY$
		#variable_conflict use_column
		DECLARE vUserID integer := (select nextval('UserID'));
			vUserUUID uuid := (select uuid_generate_v4());
			vUserPwd varchar := (select crypt(vUserPwd, gen_salt('bf')));
			vRoleName text;
			vRoleUUID uuid;
      BEGIN
		INSERT INTO users (userid,externalid,useruuid,username,firstname,lastname,useremail,oauth2provider,createdat,imgpath,thumbnail, userPwd)
		VALUES(vUserID,vexternalid,vUserUUID,vusername,vfirstname,vlastname,vuseremail,voauth2provider,now(),vimgpath,vthumbnail, vUserPWD);

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
		RETURN QUERY (select 	users.useruuid,
				users.firstname,
				users.lastname,
				users.useremail,
				users.createdat at time zone 'utc',
				users.updatedat at time zone 'utc'
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
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;