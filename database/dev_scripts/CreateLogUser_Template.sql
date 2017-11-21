-- Create LogUser
DO
$$
BEGIN
	IF ((SELECT 1 FROM pg_roles WHERE rolname='oauthdb_loguser') is null) THEN
	CREATE USER oauthdb_loguser WITH PASSWORD 'PASSWORD';  -- PUT YOUR PWD HERE
	END IF;
	CREATE FOREIGN DATA WRAPPER postgresql VALIDATOR postgresql_fdw_validator;
	CREATE SERVER oauthdb_server FOREIGN DATA WRAPPER postgresql OPTIONS (hostaddr '127.0.0.1', dbname 'DBNAME'); -- PUT YOUR DATABASENAME HERE
	CREATE USER MAPPING FOR oauthdb_loguser SERVER oauthdb_server OPTIONS (user 'oauthdb_loguser', password 'PASSWORD'); -- PUT YOUR PWD HERE
	GRANT USAGE ON FOREIGN SERVER oauthdb_server TO oauthdb_loguser;
	GRANT INSERT ON TABLE logtable TO oauthdb_loguser;	
END;
$$; 