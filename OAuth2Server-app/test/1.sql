﻿-- FUNCTION: public.createlog(integer, character varying, character varying, character varying)

-- DROP FUNCTION public.createlog(integer, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION public.createlog(
	vlogstatusid integer,
	vlogmessage character varying,
	vlogobjectname character varying,
	vparameters character varying)
    RETURNS void
    LANGUAGE 'plpgsql'
AS $BODY$

      DECLARE vLogID integer:= (select nextval('LogID'));
	      vSqlCmd varchar := concat(
              							'INSERT INTO LogTable(LogID, LogStatusID, LogMessage, LogObjectName, Parameters,CreatedAt)',
              							'VALUES( ',
              							cast(vLogID as varchar),
              							', ',
              							cast(vLogStatusID as varchar),
              							', ',
              							vLogMessage,
              							', ',
              							vLogObjectName,
              							', ',
              							vParameters,
              							', ',
              							now()
                                   );
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

$BODY$;

ALTER FUNCTION public.createlog(integer, character varying, character varying, character varying)
    OWNER TO postgres;



