-- Generiert von Oracle SQL Developer Data Modeler 4.0.3.853
--   am/um:        2017-07-12 14:34:02 MESZ
--   Site:      DB2/UDB 8.1
--   Typ:      DB2/UDB 8.1 

CREATE
  TABLE AccessTokens
  (
    AccessTokenID INTEGER NOT NULL ,
    AccessToken   VARCHAR (256) ,
    Expires       timestamp without time zone NOT NULL ,
    ScopeID       INTEGER ,
    ClientID      INTEGER NOT NULL ,
    UserID        INTEGER NOT NULL ,
    CreatedAt     timestamp without time zone NOT NULL
  ) ;
ALTER TABLE AccessTokens ADD CONSTRAINT AccessTokens_PK PRIMARY KEY (
AccessTokenID ) ;
ALTER TABLE AccessTokens ADD CONSTRAINT AccessTokens__UN UNIQUE ( AccessToken )
;

CREATE
  TABLE AuthorizationCodes
  (
    AuthorizationCodeID INTEGER NOT NULL ,
    AuthorizationCode   VARCHAR (256) NOT NULL ,
    Expires             timestamp without time zone NOT NULL ,
    RedirectURI         VARCHAR (4000) ,
    ClientID            INTEGER ,
    UserID              INTEGER NOT NULL ,
    CreatedAt           timestamp without time zone NOT NULL
  ) ;
ALTER TABLE AuthorizationCodes ADD CONSTRAINT AuthorizationCodes_PK PRIMARY KEY
( AuthorizationCodeID ) ;
ALTER TABLE AuthorizationCodes ADD CONSTRAINT AuthorizationCodes__UN UNIQUE (
AuthorizationCode ) ;

CREATE
  TABLE Clients
  (
    ClientID     INTEGER NOT NULL ,
    ClientUUID   UUID NOT NULL ,
    ClientName   VARCHAR (256) ,
    ClientSecret VARCHAR (80) ,
    RedirectURIs Text[] ,
    Grants       Text[] ,
    ScopeID      INTEGER,
    UserID       INTEGER NOT NULL ,
    CreatedAt    timestamp without time zone NOT NULL
  ) ;
ALTER TABLE Clients ADD CONSTRAINT Clients_PK PRIMARY KEY ( ClientID ) ;

CREATE
  TABLE LogStatus
  (
    LogStatusID          INTEGER NOT NULL ,
    LogStatus            VARCHAR (50) ,
    LogStatusDescription VARCHAR (250)
  ) ;
ALTER TABLE LogStatus ADD CONSTRAINT LogStatus_PK PRIMARY KEY ( LogStatusID ) ;

CREATE
  TABLE LogTable
  (
    LogID         INTEGER NOT NULL ,
    LogStatusID   INTEGER NOT NULL ,
    LogMessage    VARCHAR (4000) NOT NULL ,
    LogObjectName VARCHAR (250) ,
    Parameters    VARCHAR (4000) ,
    CreatedAt     timestamp without time zone NOT NULL
  ) ;
ALTER TABLE LogTable ADD CONSTRAINT LogTable_PK PRIMARY KEY ( LogID ) ;
--Step0
insert into logstatus(logstatusid,logstatus,logstatusdescription) values 
(0,'Sucessed','Operation has successed');
insert into logstatus(logstatusid,logstatus,logstatusdescription) values 
(1,'ERROR','Operation has failed');
insert into logstatus(logstatusid,logstatus,logstatusdescription) values 
(2,'PENDING','Operation is pending');
insert into logstatus(logstatusid,logstatus,logstatusdescription) values 
(3,'Finished','Operation has finish');

CREATE
  TABLE RefreshTokens
  (
    RefreshTokenID INTEGER NOT NULL ,
    RefreshToken   VARCHAR (256) NOT NULL ,
    Expires        timestamp without time zone ,
    ScopeID        INTEGER ,
    ClientID       INTEGER NOT NULL ,
    UserID         INTEGER NOT NULL ,
    CreatedAt      timestamp without time zone NOT NULL
  ) ;
ALTER TABLE RefreshTokens ADD CONSTRAINT RefreshTockens_PK PRIMARY KEY (
RefreshTokenID ) ;
ALTER TABLE RefreshTokens ADD CONSTRAINT RefreshTokens__UN UNIQUE (
RefreshToken ) ;

CREATE
  TABLE Roles
  (
    RoleID          INTEGER NOT NULL ,
    RoleUUID        UUID NOT NULL ,
    RoleName        VARCHAR (250) NOT NULL ,
    RoleDescription VARCHAR (4000)
  ) ;
ALTER TABLE Roles ADD CONSTRAINT Roles_PK PRIMARY KEY ( RoleID ) ;
ALTER TABLE Roles ADD CONSTRAINT Roles__UN UNIQUE ( RoleName ) ;

CREATE
  TABLE Scopes
  (
    ScopeID     INTEGER NOT NULL ,
    ScopeUUID   UUID ,
    IsDefault   bool ,
    Parameters  VARCHAR (4000) ,
    Description VARCHAR (4000) ,
    CreatedAt   timestamp without time zone NOT NULL
  ) ;
ALTER TABLE Scopes ADD CONSTRAINT Scopes_PK PRIMARY KEY ( ScopeID ) ;
ALTER TABLE Scopes ADD CONSTRAINT Scopes__UN UNIQUE ( Parameters ) ;

CREATE
  TABLE ScopesRoles
  (
    ScopeID INTEGER NOT NULL ,
    RoleID  INTEGER NOT NULL
  ) ;

CREATE
  TABLE Users
  (
    UserID         INTEGER NOT NULL ,
    ExternalID     VARCHAR (4000) ,
    UserUUID       UUID NOT NULL ,
    UserName       VARCHAR (250) NOT NULL ,
    UserPwd        VARCHAR ,
    FirstName      VARCHAR (250) ,
    LastName       VARCHAR ,
    UserEmail      VARCHAR (2000) ,
    OAuth2Provider VARCHAR (250) ,
    CreatedAt      timestamp without time zone ,
    UpdatedAt      timestamp without time zone ,
    ImgPath        VARCHAR (1000) ,
    Thumbnail 	   bytea
  ) ;
ALTER TABLE Users ADD CONSTRAINT Users_PK PRIMARY KEY ( UserID ) ;
ALTER TABLE Users ADD CONSTRAINT Users__UN UNIQUE ( UserName, UserEmail ) ;

CREATE
  TABLE UsersRoles
  (
    UserID INTEGER NOT NULL ,
    RoleID INTEGER NOT NULL
  ) ;
ALTER TABLE UsersRoles ADD CONSTRAINT UsersRoles_PK PRIMARY KEY ( UserID,
RoleID ) ;

ALTER TABLE AccessTokens ADD CONSTRAINT AccessTokens_Clients_FK FOREIGN KEY (
ClientID ) REFERENCES Clients ( ClientID ) ON
DELETE
  NO ACTION ;

ALTER TABLE AccessTokens ADD CONSTRAINT AccessTokens_Scopes_FK FOREIGN KEY (
ScopeID ) REFERENCES Scopes ( ScopeID ) ON
DELETE
  NO ACTION ;

ALTER TABLE AccessTokens ADD CONSTRAINT AccessTokens_Users_FK FOREIGN KEY (
UserID ) REFERENCES Users ( UserID ) ON
DELETE
  NO ACTION ;

ALTER TABLE AuthorizationCodes ADD CONSTRAINT AuthorizationCodes_Users_FK
FOREIGN KEY ( UserID ) REFERENCES Users ( UserID ) ON
DELETE
  NO ACTION ;

ALTER TABLE Clients ADD CONSTRAINT Clients_Scopes_FK FOREIGN KEY ( ScopeID )
REFERENCES Scopes ( ScopeID ) ON
DELETE
  NO ACTION ;

ALTER TABLE Clients ADD CONSTRAINT Clients_Users_FK FOREIGN KEY ( UserID )
REFERENCES Users ( UserID ) ON
DELETE
  NO ACTION ;

ALTER TABLE LogTable ADD CONSTRAINT LogTable_LogStatus_FK FOREIGN KEY (
LogStatusID ) REFERENCES LogStatus ( LogStatusID ) ON
DELETE
  NO ACTION ;

ALTER TABLE RefreshTokens ADD CONSTRAINT RefreshTockens_Clients_FK FOREIGN KEY
( ClientID ) REFERENCES Clients ( ClientID ) ON
DELETE
  NO ACTION ;

ALTER TABLE RefreshTokens ADD CONSTRAINT RefreshTockens_Scopes_FK FOREIGN KEY (
ScopeID ) REFERENCES Scopes ( ScopeID ) ON
DELETE
  NO ACTION ;

ALTER TABLE RefreshTokens ADD CONSTRAINT RefreshTockens_Users_FK FOREIGN KEY (
UserID ) REFERENCES Users ( UserID ) ON
DELETE
  NO ACTION ;

ALTER TABLE ScopesRoles ADD CONSTRAINT ScopesRoles_Roles_FK FOREIGN KEY (
RoleID ) REFERENCES Roles ( RoleID ) ON
DELETE
  NO ACTION ;

ALTER TABLE ScopesRoles ADD CONSTRAINT ScopesRoles_Scopes_FK FOREIGN KEY (
ScopeID ) REFERENCES Scopes ( ScopeID ) ON
DELETE
  NO ACTION ;

ALTER TABLE UsersRoles ADD CONSTRAINT UsersRoles_Roles_FK FOREIGN KEY ( RoleID
) REFERENCES Roles ( RoleID ) ON
DELETE
  NO ACTION ;

ALTER TABLE UsersRoles ADD CONSTRAINT UsersRoles_Users_FK FOREIGN KEY ( UserID
) REFERENCES Users ( UserID ) ON
DELETE
  NO ACTION ;


-- Zusammenfassungsbericht für Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            11
-- CREATE INDEX                             0
-- ALTER TABLE                             30
-- CREATE VIEW                              0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE STRUCTURED TYPE                   0
-- CREATE ALIAS                             0
-- CREATE BUFFERPOOL                        0
-- CREATE DATABASE                          0
-- CREATE DISTINCT TYPE                     0
-- CREATE INSTANCE                          0
-- CREATE DATABASE PARTITION GROUP          0
-- CREATE SCHEMA                            0
-- CREATE SEQUENCE                          0
-- CREATE TABLESPACE                        0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
