/**
 * Created by beuttlerma on 04.07.17.
 */
var logger = require('../../global/logger');

function getAccessToken(bearerToken) {
    logger.info("getAccessToken", bearerToken);

}

function getClient(clientId, clientSecret) {
    logger.info("getClient", clientId, clientSecret);

    //TODO: Get and verify client with local database
    var clientWithGrants = {};
    clientWithGrants.client_id = clientId;
    clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
    clientWithGrants.redirectUris = ['http://localhost:3004/auth/google/callback'];

    return clientWithGrants;
}


function getUser(username, password) {
    logger.info('getUser');
}

function revokeAuthorizationCode(code) {
    logger.info("revokeAuthorizationCode ", code);
}

function revokeToken(token) {
    logger.info("revokeToken", token);
}


function saveToken(token, client, user) {
    logger.info("saveToken", token, client, user);

    return {
        client: client,
        user: user,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt
    }
}

function getAuthorizationCode(code) {
    logger.info("getAuthorizationCode", code);
}

function saveAuthorizationCode(code, client, user) {
    logger.info("saveAuthorizationCode", code, client, user);
}

function getUserFromClient(client) {
    logger.info("getUserFromClient", client);
}

function getRefreshToken(refreshToken) {
    logger.info("getRefreshToken", refreshToken);
    return refreshToken;
}

function validateScope(token, scope) {
    logger.info("validateScope", token, scope);
    return (token.scope === scope && scope !== null) ? scope : false
}

function verifyScope(token, scope) {
    logger.info("verifyScope", token, scope);
    return token.scope === scope
}

module.exports = {
    //generateOAuthAccessToken, optional - used for jwt
    //generateAuthorizationCode, optional
    //generateOAuthRefreshToken, - optional
    getAccessToken: getAccessToken,
    getAuthorizationCode: getAuthorizationCode,
    getClient: getClient,
    getRefreshToken: getRefreshToken,
    getUser: getUser,
    getUserFromClient: getUserFromClient,
    //grantTypeAllowed, Removed in oauth2-server 3.0
    revokeAuthorizationCode: revokeAuthorizationCode,
    revokeToken: revokeToken,
    saveToken: saveToken,
    saveAuthorizationCode: saveAuthorizationCode,
    validateScope: validateScope,
    verifyScope: verifyScope,
}