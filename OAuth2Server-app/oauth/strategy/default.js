/**
 * Created by beuttlerma on 04.07.17.
 */
var logger = require('../../global/logger');
var dbToken = require('../../database/function/tokens');
var dbUser = require('../../database/function/user');
var dbClient = require('../../database/function/client');
var dbScope = require('../../database/function/scope');

function getAccessToken(bearerToken) {
    var _err;
    var _data;
    dbToken.getAccessToken(bearerToken, function(err, data) {
        _err = err;
       _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function getClient(clientId, clientSecret) {

    //TODO: Get and verify client with local database
    var clientWithGrants = {};
    clientWithGrants.client_id = clientId;
    clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
    clientWithGrants.redirectUris = ['http://localhost:3004/auth/google/callback'];

    return clientWithGrants;
}

function getUser(username, accesstoken) {
    var _err;
    var _data;
    dbUser.getUser(username, accesstoken, function(err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function revokeAuthorizationCode(code) {
    logger.info("revokeAuthorizationCode ", code);
}

function revokeToken(token) {
    logger.info("revokeToken", token);
}

function saveToken(accessToken, expiresAccessToken, refreshToken, expiresRefreshToken, scope, clientid, userid) {
    var _err;
    var _data;
    dbToken.saveToken(accessToken, expiresAccessToken, refreshToken, expiresRefreshToken, scope, clientid, userid, function(err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function getAuthorizationCode(code) {
    var _err;
    var _data;
    dbToken.getAuthorizationCode( function(err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function saveAuthorizationCode(code, client, user) {
    logger.info("saveAuthorizationCode", code, client, user);
}

function getUserFromClient(client) {
    var _err;
    var _data;
    dbUser.getUserFromClient(client, function(err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function getRefreshToken(refreshToken) {
    var _err;
    var _data;
    dbToken.getRefreshToken(refreshToken, function(err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
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