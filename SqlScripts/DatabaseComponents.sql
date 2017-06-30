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
	UserUUID uuid,
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
-- CreateAccessTokens
CREATE FUNCTION createaccesstoken(vexpires timestamp without time zone,vscopeuuid uuid,vclientuuid uuid,vuseruuid uuid) 
     RETURNS TABLE (
		AccessToken varchar,
	    Expires timestamp with time zone,
		ScopeUUID uuid,
		ClientUUID uuid,
		UserUUID uuid,
		CreatedAt timestamp with time zone
	 ) AS
  $BODY$
	  #variable_conflict use_column
      DECLARE 	vAccessTokenID integer := (select nextval('AccessTokenID'));      
				vAccessToken varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-','')); 
				vUserID integer := (select userid from users where useruuid = vuseruuid); 
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid);
		BEGIN		
			INSERT INTO accesstokens (accesstokenid,accesstoken,expires,scopeid,clientid,userid,createdat)
			VALUES(vAccessTokenID,vAccessToken,vexpires,vScopeID,vclientid,vUserID,now());
		
			-- Begin Log if success
        perform public.createlog(0,'Created AccessToken sucessfully', 'createaccesstoken', 
                                'Expires: ' || cast(vexpires as varchar) || 
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));
		
		-- RETURN
		RETURN QUERY (select 
					AccessToken,
					Expires at time zone 'utc',
					vscopeuuid as scopeuuid,
					vclientuuid as clientuuid,
					vuseruuid as useruuid,
					createdat at time zone 'utc'
			from accesstokens ac
			where accesstokenid = vAccessTokenID);
			
		exception when others then 
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,  'createaccesstoken', 
                                'Expires: ' || cast(vexpires as varchar) || 
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', ClientID: ' || cast(vClientID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));
								
		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createaccesstoken';
        -- End Log if error 
		
		END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateRefreshTokens  
CREATE FUNCTION public.createrefreshtoken(
    vexpires timestamp without time zone,
    vscopeuuid uuid,
    vclientuuid uuid,
    vuseruuid uuid)
  RETURNS TABLE (
		RefreshToken varchar,
	    Expires timestamp with time zone,
		ScopeUUID uuid,
		ClientUUID uuid,
		UserUUID uuid,
		CreatedAt timestamp with time zone
	 ) AS
$BODY$     
	  #variable_conflict use_column
      DECLARE 	vRefreshTokenID integer := (select nextval('RefreshID'));      
		vRefreshToken varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v4())::text,'-',''));
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
-- CreateClients
CREATE FUNCTION createclient(vclientname character varying,vclientsecret character varying,
							vredirecturi character varying,vgranttypes character varying,vscopeuuid uuid,vuseruuid uuid) 
     RETURNS TABLE (
		ClientUUID uuid,
		ClientName character varying,
		ClientSecret character varying,
		RedirectURI character varying,
		GrantTypes character varying,
		ScopeUUID uuid,
		UserUUID uuid,
		CreatedAt timestamp with time zone
	 )
	 AS
  $BODY$
		#variable_conflict use_column
		DECLARE	vClientID integer := (select nextval('ClientID'));
				vClientUUID uuid := (select uuid_generate_v4());
				vUserID integer := (select userid from users where useruuid = vuseruuid);
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
      BEGIN		
		INSERT INTO clients (clientid,clientuuid,clientname,clientsecret,redirecturi,granttypes,scopeid,userid,createdat)
		VALUES(vClientID,vClientUUID,vclientname,vclientsecret,vredirecturi,vgranttypes,vScopeID,vUserID,now());
		
		-- Begin Log if success
        perform public.createlog(0,'Created Client sucessfully', 'createclient', 
                                'ClientName: ' || vClientName || 
								', ClientSecret: ' || vclientsecret ||
								', RedirectURI: ' || vredirecturi ||
								', GrantTypes: ' || vgranttypes ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));
								
		RETURN QUERY (
			select 	ClientUUID,
					ClientName,
					ClientSecret,
					RedirectURI,
					GrantTypes,
					ScopeUUID,
					UserUUID,
					CreatedAt at time zone 'utc'
			from clients where clientid = vClientID);
		
		
		exception when others then 
        -- Begin Log if error
        perform public.createlog(1,'ERROR: ' || SQLERRM || ' ' || SQLSTATE,'createclient', 
                                'ClientName: ' || vClientName || 
								', ClientSecret: ' || vclientsecret ||
								', RedirectURI: ' || vredirecturi ||
								', GrantTypes: ' || vgranttypes ||
								', ScopeID: ' || cast(vScopeID as varchar) ||
								', UserID: ' || cast(vUserID as varchar));
								
		RAISE EXCEPTION '%', 'ERROR: ' || SQLERRM || ' ' || SQLSTATE || ' at createclient';
        -- End Log if error 
		
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateAuthorizationCode
CREATE FUNCTION createauthorizationcode(vexpires timestamp without time zone,vredirecturi character varying,vclientuuid uuid,vuseruuid uuid) 
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
				vAuthorizationCode varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-',''));
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
	      vConnExist bool := (select ('{' || vConnName || '}')::text[] <@ (select dblink_get_connections()));
      BEGIN       
		set role oauthdb_loguser;
		if(not vConnExist or vConnExist is null) then				
				perform dblink_connect(vConnName,'oauthdb_server');  
			else			
				set role oauthdb_loguser;		 
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