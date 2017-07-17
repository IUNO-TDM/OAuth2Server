/**
 * Created by beuttlerma on 04.07.17.
 */
var logger = require('../../global/logger');
var dbToken = require('../../database/function/tokens');
var dbUser = require('../../database/function/user');
var dbClient = require('../../database/function/client');
var dbScope = require('../../database/function/scope');
var dbAuthorization = require('../../database/function/authorization');

function getAccessToken(bearerToken) {
    logger.info('GetAccessToken', bearerToken);
    var _err;
    var _data;
    var _user;

    dbToken.getAccessToken(bearerToken, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });


    dbUser.getUserByID(_data.user, function (err, user) {
        _err = err;
        _user = user;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_user;
    });

    _data.user = _user;
    _data.client = {
        id: _data.client
    };

    return _data;
}

function getClient(clientID, clientSecret) {
    logger.info('GetClient ', clientID, clientSecret);

    var _err;
    var _data;
    dbClient.getClient(clientID, clientSecret, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });
    return _data;
}

function getUser(username, password) {
    logger.info('GetUser ', username, password);
    var _err;
    var _data;
    dbUser.getUser(username, password, function (err, data) {
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
    logger.warn('-- NOT IMPLEMENTED YET --');
    return false;
}

function revokeToken(token) {
    logger.info("revokeToken", token);
    logger.warn('-- NOT IMPLEMENTED YET --');
    //TODO: Delete Refresh Token
    return true;
}

function saveToken(accessToken, client, user) {
    logger.info('SaveToken ', accessToken, client, user);

    var _err;
    var _data;
    dbToken.saveToken(accessToken.accessToken, accessToken.accessTokenExpiresAt, accessToken.refreshToken,
        accessToken.refreshTokenExpiresAt, accessToken.scope,
        client.id, user.id, function (err, data) {
            _err = err;
            _data = data;
        });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function getAuthorizationCode(code) {
    logger.info('GetAuthorizationCode ', code);
    var _err;
    var _data;
    dbAuthorization.getAuthorizationCode(code, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function saveAuthorizationCode(code, expires, redirecturi, client, user) {
    logger.info('SaveAuthorizationCode ', code, expires, redirecturi, client, user);

    var _err;
    var _data;
    dbAuthorization.saveAuthorizationCode(code, expires, redirecturi, client, user, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    return _data;
}

function getUserFromClient(client) {
    logger.info('GetUserFromClient ', client);

    var _err;
    var _data;
    dbUser.getUserFromClient(client.id, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    _data.id = _data.useruuid;

    return _data;
}

function getRefreshToken(refreshToken) {
    logger.info('GetRefreshToken ', refreshToken);
    var _err;
    var _data;
    dbToken.getRefreshToken(refreshToken, function (err, data) {
        _err = err;
        _data = data;
    });

    require('deasync').loopWhile(function () {
        return !_err && !_data;
    });

    _data.client = {id: _data.client};

    var user;
    dbUser.getUserByID(_data.user, function (err, _user) {
        user = _user;
    });
    require('deasync').loopWhile(function () {
        return !user;
    });

    _data.user = user;

    return _data;
}

function validateScope(user, client, scope) {
    logger.info("validateScope", user, client, scope);
    return (user.scope === client.scope) ? scope : false
}

function verifyScope(token, scope) {
    logger.info("verifyScope", token, scope);
    return true;
}

function validateToken(token) {
    logger.info('ValidateToken ', token);


    var isValid = true;

    isValid = isValid && token != undefined;
    isValid = isValid && token.user != undefined;
    isValid = isValid && token.user.id != undefined;
    isValid = isValid && new Date(token.accessTokenExpiresAt) > new Date();


    return isValid;
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
    validateToken: validateToken,
    // validateScope: validateScope,
    // verifyScope: verifyScope,
}