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
							vroleuuid integer,
							vusername character varying,
							vfirstname character varying,
						    vlastname character varying,
							vuseremail character varying,
							vsource character varying,
							vimgpath character varying,
							vthumbnail bytea) 
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE vUserID integer := (select nextval('UserID'));      
				vUserUUID uuid := (select uuid_generate_v4()); 
				vRoleID integer :=(select roleid from roles where roleuuid = vRoleUUID);
      BEGIN	
		INSERT INTO users (userid,externalid,useruuid,roleid,username,firstname,lastname,useremail,source,createdat,imgpath,thumbnail)
		VALUES(vUserID,vexternalid,vUserUUID,vRoleID,vusername,vfirstname,vlastname,vuseremail,vsource,now(),vimgpath,vthumbnail);
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
--CreateUserRoles
CREATE FUNCTION createusersroles(vuseruuid integer, vroleuuid integer, vexternalid character varying) 
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
CREATE FUNCTION createroles(vrolename character varying, vroledescription character varying, vscopeuuid uuid) 
     RETURNS void AS
  $BODY$
		#variable_conflict use_column
		DECLARE vRoleID integer := (select nextval('RoleID'));      
				vRoleUUID uuid := (select uuid_generate_v4()); 
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
			BEGIN
				INSERT INTO roles (roleid,roleuuid,rolename,roledescription,scopeid)
				VALUES(vRoleID,vRoleUUID,vrolename,vroledescription,vScopeID);
			END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateAccessTokens
CREATE FUNCTION createaccesstokens(accesstoken character varying,expires timestamp without time zone,scopeuuid uuid,clientuuid uuid,useruuid uuid,createdat timestamp without time zone) 
     RETURNS void AS
  $BODY$
	  #variable_conflict use_column
      DECLARE 	vAccessTokenID integer := (select nextval('AccessTokenID'));      
				vAccessTokenUUID uuid := (select uuid_generate_v4()); 
				vUserID integer := (select userid from users where useruuid = useruuid); 
				vScopeID integer := (select scopeid from scopes where scopeuuid = scopeuuid);
				vClientID integer := (select clientid from clients where clientuuid = clientuuid);
		BEGIN		
			INSERT INTO accesstokens (accesstokenid,accesstokenuuid,accesstoken,expires,scopeid,clientid,userid,createdat)
			VALUES(vAccessTokenID,vAccessTokenUUID,vaccesstoken,vexpires,vScopeID,vclientid,vUserID,now());
		END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateRefreshTokens  
CREATE FUNCTION createrefreshtokens(vexpires timestamp without time zone,vscopeuuid integer,vclientuuid integer,vuseruuid integer) 
     RETURNS void AS
  $BODY$     
	  #variable_conflict use_column
      DECLARE 	vRefreshTokenID integer := (select nextval('RefreshTokenID'));      
				vRefreshTokenUUID uuid := (select uuid_generate_v4());
				vUserID integer := (select userid from users where useruuid = vuseruuid); 
				vScopeID integer := (select scopeid from scopes where scopeuuid = vscopeuuid);
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid);				
		BEGIN		
      INSERT INTO refreshtokens (refreshtokenid,refreshtokenuuid,expires,scopeid,clientid,userid,createdat)
       VALUES(vRefreshTokenID,vRefreshTokenUUID,vexpires,vScopeID,vClientID,vUserID,now());
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateScopes  
CREATE FUNCTION createscopes(visdefault boolean,vparameters character varying,vdescription character varying) 
     RETURNS void AS
  $BODY$
       #variable_conflict use_column
	   DECLARE 	vScopeID integer := (select nextval('ScopeID'));
				vScopeUUID uuid := (select uuid_generate_v4());
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid);
		BEGIN		
      INSERT INTO scopes (scopeid,scopeuuid,isdefault,parameters,description,createdat)
       VALUES(vScopeID,vScopeUUID,visdefault,vparameters,vdescription,now());
      END;
  $BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
-- ##########################################################################
-- CreateClients
CREATE FUNCTION createclients(vclientname character varying,vclientsecret character varying,vredirecturi character varying,vgranttypes character varying,vscopeuuid integer,vuseruuid integer) 
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
CREATE FUNCTION createauthorizationcodes(vexpires timestamp without time zone,vredirecturi character varying,vclientuuid integer,vuseruuid integer) 
     RETURNS void AS
  $BODY$
      #variable_conflict use_column
	   DECLARE 	vAuthorizationCodeID integer := (select nextval('AuthorizationCodeID'));
				vAuthorizationCodeUUID uuid := (select uuid_generate_v4());
				vUserID integer := (select userid from users where useruuid = vuseruuid);
				vClientID integer := (select clientid from clients where clientuuid = vclientuuid); 
	   BEGIN			
      INSERT INTO authorizationcodes (authorizationcodeid,authorizationcodeuuid,expires,redirecturi,clientid,userid,createdat)
       VALUES(vauthorizationcodeid,vAuthorizationCodeUUID,vexpires,vredirecturi,vClientID,vUserID,now());
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