-- ##########################################################################
-- Author: Marcel Ely Gomes
-- Company: Trumpf Werkzeugmaschine GmbH & Co KG
-- CreatedAt: 2017-07-25
-- Description: Create Base Data for the OAuth Database
-- Changes:
-- ##########################################################################
DO
$$
	Declare
		vUserUUID uuid;
		vRoleUUID uuid;
		vGrants text[] := '{authorization_code, password, refresh_token, client_credentials}';
		vRedirectUris text[] := '{https://iuno-tdm.axoom.cloud}';


	Begin
		--Create User
		perform createuser (null, 'Admin', null, null, 'admin@iuno.com', null, null, null,'Admin');
		perform createuser (null, 'MaxMuster', 'Max', 'Mustermann', 'max.mustermann@iuno.com', null, null, null,'TechnologyDataOwner');
		perform createuser (null, 'AnaMuster', 'Ana', 'Musterfrau', 'ana.musterfrau@iuno.com', null, null, null,'TechnologyDataOwner');
		perform createuser (null, 'PublicUser', null, null, 'public@iuno.com', null, null, null,'Public');
		perform createuser (null, 'JuiceWebSiteUser', null, null, 'juicewebsite@iuno.com', null, null, null,'MarketplaceComponent');
		perform createuser (null, 'MarketplaceCoreUser', null, null, 'marketplacecoreuser@iuno.com', null, null, null,'MarketplaceComponent');
		perform createuser (null, 'MixerControlUser', null, null, 'mixercontrol@iuno.com', null, null, null,'MarketplaceComponent');
		perform createuser (null, 'JuiceMachineServiceUser', null, null, 'juicemachineservice@iuno.com', null, null, null,'MarketplaceComponent');

		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41730'::uuid where username = 'Admin';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41731'::uuid where username = 'MaxMuster';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41732'::uuid where username = 'AnaMuster';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41733'::uuid where username = 'PublicUser';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41734'::uuid where username = 'JuiceWebSiteUser';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41735'::uuid where username = 'MarketplaceCoreUser';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41736'::uuid where username = 'MixerControlUser';
		update users set useruuid = 'adb4c297-45bd-437e-ac90-9179eea41737'::uuid where username = 'JuiceMachineServiceUser';

		--Create Role
		perform createrole('Public','Everyone that visit the marketplace without login. The public role Is only allowed to read a pre defined area (e.g. Landing Page).');
		perform createrole('MachineOperator','It can be the machine owner as well as the machine operator.');
		perform createrole('TechnologyDataOwner','Is the creator and administrator of Technology Data');
		perform createrole('MarketplaceComponent','Is the creator and administrator of Technology Data');
		perform createrole('TechnologyAdmin','Administrate technologies.');
		perform createrole('Admin','Is the main marketplace admin.');
		perform createrole('MarketplaceCore','Is the only role with access to core functions');

		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41738'::uuid where rolename = 'Public';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41739'::uuid where rolename = 'MachineOperator';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41740'::uuid where rolename = 'TechnologyDataOwner';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41741'::uuid where rolename = 'MarketplaceComponent';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41742'::uuid where rolename = 'TechnologyAdmin';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41743'::uuid where rolename = 'Admin';
		update roles set roleuuid = 'adb4c297-45bd-437e-ac90-9179eea41001'::uuid where rolename = 'MarketplaceCore';

		--Create UsersRoles and Clients
		--PublicUser
		vUserUUID := (select useruuid from users where username = 'PublicUser');
		vRoleUUID := (select roleuuid from roles where rolename = 'Public');
		perform createusersroles(vUserUUID, vRoleUUID);
		--MaxMuster
		vUserUUID := (select useruuid from users where username = 'MaxMuster');
		vRoleUUID := (select roleuuid from roles where rolename = 'TechnologyDataOwner');
		perform createusersroles(vUserUUID, vRoleUUID);
		--AnaMuster
		vUserUUID := (select useruuid from users where username = 'AnaMuster');
		perform createusersroles(vUserUUID, vRoleUUID);
		--Admin
		vUserUUID := (select useruuid from users where username = 'Admin');
		vRoleUUID := (select roleuuid from roles where rolename = 'Admin');
		perform createusersroles(vUserUUID, vRoleUUID);
		--JuiceWebSiteUser
        vUserUUID := (select useruuid from users where username = 'JuiceWebSiteUser');
        vRoleUUID := (select roleuuid from roles where rolename = 'MarketplaceComponent');
        perform createusersroles(vUserUUID, vRoleUUID);
        perform createclient('JuiceWebSite','IsSecret',vuseruuid, vGrants, vRedirectUris,null);
        --MarketplaceCoreUser
        vUserUUID := (select useruuid from users where username = 'MarketplaceCoreUser');
        vRoleUUID := (select roleuuid from roles where rolename = 'MarketplaceCore');
        perform createusersroles(vUserUUID, vRoleUUID);
        perform createclient('MarketplaceCore','IsSecret',vuseruuid, vGrants, vRedirectUris,null);
        --MixerControlUser
        vUserUUID := (select useruuid from users where username = 'MixerControlUser');
        vRoleUUID := (select roleuuid from roles where rolename = 'MachineOperator');
        perform createusersroles(vUserUUID, vRoleUUID);
        perform createclient('MixerControl','IsSecret',vuseruuid, vGrants, vRedirectUris,null);
        --JuiceMachineServiceUser
        vUserUUID := (select useruuid from users where username = 'JuiceMachineServiceUser');
        vRoleUUID := (select roleuuid from roles where rolename = 'MarketplaceComponent');
        perform createusersroles(vUserUUID, vRoleUUID);
        perform createclient('JuiceMachineService','IsSecret',vuseruuid, vGrants, vRedirectUris,null);

		-- Set fixes UUIDs for the clients
		update clients set clientuuid = 'adb4c297-45bd-437e-ac90-9179eea41744' where clientname = 'JuiceWebSite';
		update clients set clientuuid = 'adb4c297-45bd-437e-ac90-9179eea41745' where clientname = 'MarketplaceCore';
		update clients set clientuuid = 'adb4c297-45bd-437e-ac90-9179eea41746' where clientname = 'MixerControl';
		update clients set clientuuid = 'adb4c297-45bd-437e-ac90-9179eea41747' where clientname = 'JuiceMachineService';
	End;

$$;
COMMIT;