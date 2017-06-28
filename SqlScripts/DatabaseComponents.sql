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
CREATE FUNCTION createusers(vexternalid character varying,  
							vusername character varying,
							vfirstname character varying,
						    vlastname character varying,
							vuseremail character varying,
							voauth2provider character varying,
							vimgpath character varying,
							vthumbnail bytea) 
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE vUserID integer := (select nextval('UserID'));      
				vUserUUID uuid := (select uuid_generate_v4());  
      BEGIN	
		INSERT INTO users (userid,externalid,useruuid,username,firstname,lastname,useremail,oauth2provider,createdat,imgpath,thumbnail)
		VALUES(vUserID,vexternalid,vUserUUID,vusername,vfirstname,vlastname,vuseremail,voauth2provider,now(),vimgpath,vthumbnail);
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
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateRoles
CREATE FUNCTION createroles(vrolename character varying, vroledescription character varying) 
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE vRoleID integer := (select nextval('RoleID'));      
				vRoleUUID uuid := (select uuid_generate_v4());  
			BEGIN
				INSERT INTO roles (roleid,roleuuid,rolename,roledescription)
				VALUES(vRoleID,vRoleUUID,vrolename,vroledescription);
			END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateAccessTokens
CREATE FUNCTION createaccesstokens(expires timestamp without time zone,scopeuuid uuid,clientuuid uuid,useruuid uuid) 
     RETURNS void AS
  $BODY$
	  #variable_conflict use_column
      DECLARE 	vAccessTokenID integer := (select nextval('AccessTokenID'));      
				vAccessToken varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-','')); 
				vUserID integer := (select userid from users where useruuid = useruuid); 
				vScopeID integer := (select scopeid from scopes where scopeuuid = scopeuuid);
				vClientID integer := (select clientid from clients where clientuuid = clientuuid);
		BEGIN		
			INSERT INTO accesstokens (accesstokenid,accesstoken,expires,scopeid,clientid,userid,createdat)
			VALUES(vAccessTokenID,vAccessToken,vexpires,vScopeID,vclientid,vUserID,now());
		END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateRefreshTokens  
CREATE OR REPLACE FUNCTION public.createrefreshtokens(
    vexpires timestamp without time zone,
    vscopeuuid uuid,
    vclientuuid uuid,
    vuseruuid uuid)
  RETURNS void AS
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
	END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
-- ##########################################################################
-- CreateScopes  
CREATE FUNCTION createscopes(visdefault boolean,vparameters character varying,vdescription character varying) 
     RETURNS void AS
  $BODY$
       #variable_conflict use_column
	   DECLARE 	vScopeID integer := (select nextval('ScopeID'));
				vScopeUUID uuid := (select uuid_generate_v4()); 
		BEGIN		
      INSERT INTO scopes (scopeid,scopeuuid,isdefault,parameters,description,createdat)
       VALUES(vScopeID,vScopeUUID,visdefault,vparameters,vdescription,now());
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateClients
CREATE FUNCTION createclients(vclientname character varying,vclientsecret character varying,
							vredirecturi character varying,vgranttypes character varying,vscopeuuid uuid,vuseruuid uuid) 
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE	vClientID integer := (select nextval('ClientID'));
				vClientUUID uuid := (select uuid_generate_v4());
				vUserID integer := (select userid from users where useruuid = vuseruuid);
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
      BEGIN		
		INSERT INTO clients (clientid,clientuuid,clientname,clientsecret,redirecturi,granttypes,scopeid,userid,createdat)
		VALUES(vClientID,vClientUUID,vclientname,vclientsecret,vredirecturi,vgranttypes,vScopeID,vUserID,now());
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateAuthorizationCode
CREATE FUNCTION createauthorizationcodes(vexpires timestamp without time zone,vredirecturi character varying,vclientuuid uuid,vuseruuid uuid) 
     RETURNS void AS
  $BODY$
      #variable_conflict use_column
	   DECLARE 	vAuthorizationCodeID integer := (select nextval('AuthorizationCodeID'));
				vAuthorizationCode varchar := (select replace((select uuid_generate_v4())::text || (select uuid_generate_v1mc())::text,'-',''));
				vUserID integer := (select userid from users where useruuid = vuseruuid);
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid); 
	   BEGIN			
      INSERT INTO authorizationcodes (authorizationcodeid,authorizationcode,expires,redirecturi,clientid,userid,createdat)
       VALUES(vauthorizationcodeid,vAuthorizationCode,vexpires,vredirecturi,vClientID,vUserID,now());
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
		set role dblink_loguser;
		if(not vConnExist or vConnExist is null) then				
				perform dblink_connect(vConnName,'fdtest');  
			else			
				set role dblink_loguser;		 
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
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;