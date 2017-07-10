/**
 * Created by ElyGomesMa on 10.07.2017.
 */

/***
 * Parameters needs to be change according to the Database content
 *
* */
var func = require('../oauth/strategy/default');

//Test GetUserFromClient()
var client = '43d9bfb5-cdf4-4a00-9658-175397a69efc';
var dataClient = func.getUserFromClient(client);

//Test GetAccessToken()
var token = '1234';
var dataAccToken = func.getAccessToken(token);


//Test GetRefreshToken()
var token = '4321232';
var dataRefToken = func.getRefreshToken(token);

//Test GetUser
var useruuid = 'd6959d6c-bac6-4ad0-b3a2-4df87334c475';
var accesstoken = 'c96672dfe68d473693053384d9242490abb77e2a5da811e79306abdd97cf247b';
var dataUser = func.getUser(useruuid,accesstoken);

//Test saveToken
var accessToken = '12345678'
var expieresAccessToken = '2017-12-31 00:00:00'
var refreshToken = '3212312'
var expiresRefreshToken = '2017-12-31 00:00:00'
var scope = '57339e6f-a44b-4c52-95f8-afafd73f206b'
var clientid = '43d9bfb5-cdf4-4a00-9658-175397a69efc'
var userid = 'd6959d6c-bac6-4ad0-b3a2-4df87334c475'
var dataSaveToken = func.saveToken(accessToken, expieresAccessToken, refreshToken, expiresRefreshToken, scope, clientid, userid);


//Test GetAuthorizationCode()
var code = 'ff1218a7a7724b0d8edcd1d6d34561c5f800453c5da811e78edd37cc11887d89';
var dataAccToken = func.getAuthorizationCode(code);