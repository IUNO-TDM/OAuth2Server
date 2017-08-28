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

    var dbDone = false;
    var token = false;
    var _user = false;

    dbToken.getAccessToken(bearerToken, function (err, data) {
        token = data;
        if (err) {
            logger.warn(err);

            return dbDone = true;
        }

        if (!data) {
            logger.warn('[oauth-default] Database did not return an access token');

            return dbDone = true;
        }

        dbUser.getUserByID(data.user, function (err, user) {
            if (err) {
                logger.warn(err);
            }
            _user = user;

            return dbDone = true;
        });

    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    if (token) {
        // Replace uuid references with objects (populate object)
        token.user = _user;
        token.client = {
            id: token.client
        };

        return token;
    }

    return null;
}

function getClient(clientID, clientSecret) {
    logger.info('GetClient ', clientID);

    var dbDone;
    var _data = null;

    if (clientSecret) {
        dbClient.getClient(clientID, clientSecret, function (err, data) {
            if (err) {
                logger.warn(err);
            }
            _data = data;

            dbDone = true;
        });
    }
    else {
        dbClient.getClientById(clientID, function (err, data) {
            if (err) {
                logger.warn(err);
            }
            _data = data;

            dbDone = true;
        });
    }



    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    if (!_data) {
        return new Error('Client not found');
    }
    return _data;
}

function getUser(username, password) {
    logger.info('GetUser ', username);
    var dbDone;
    var _data;
    dbUser.getUser(username, password, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        _data = data;

        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone
    });

    return _data;
}

function revokeAuthorizationCode(code) {
    logger.info("revokeAuthorizationCode ", code);
    var dbDone;
    var _data;
    dbToken.revokeAuthorizationCode(code.authorizationCode, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        _data = data;

        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone
    });

    return _data;
}

function revokeToken(token) {
    logger.info("revokeToken", token);
    var dbDone;
    var _data;
    dbToken.revokeToken(token.refreshToken, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        _data = data;

        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone
    });

    return _data;
}

function saveToken(accessToken, client, user) {
    logger.info('SaveToken ', accessToken, client, user);

    var dbDone;
    var _data;

    dbToken.saveToken(accessToken.accessToken, accessToken.accessTokenExpiresAt, accessToken.refreshToken,
        accessToken.refreshTokenExpiresAt, accessToken.scope,
        client.id, user.id, function (err, data) {
            if (err) {
                logger.warn(err);
            }
            _data = data;

            dbDone = true;
        });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    return _data;
}

function getAuthorizationCode(code) {
    logger.info('GetAuthorizationCode ', code);

    var dbDone;
    var _data;
    dbAuthorization.getAuthorizationCode(code, function (err, data) {
        if (err) {
            logger.warn(err);
            return dbDone = true;
        }
        _data = data;

        dbUser.getUserByID(data.user, function (err, user) {

            _data.user = user;
            _data.client = {
                id: data.client
            };

            dbDone = true;

        });
    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    return _data;
}

function saveAuthorizationCode(code, client, user) {
    logger.info('SaveAuthorizationCode ', code, client, user);

    var dbDone;
    var _data;
    dbAuthorization.saveAuthorizationCode(code.authorizationCode, code.expiresAt, code.redirectUri, client.id, user.id, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        _data = data;

        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    code.client = client;
    code.user = user;
    return code;
}

function getUserFromClient(client) {
    logger.info('GetUserFromClient ', client);

    var dbDone;
    var _data = null;
    dbUser.getUserFromClient(client.id, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        _data = data;

        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    return _data;
}

function getRefreshToken(refreshToken) {
    logger.info('GetRefreshToken ', refreshToken);
    var dbDone;
    var token;
    dbToken.getRefreshToken(refreshToken, function (err, data) {
        if (err) {
            logger.warn(err);
        }
        token = data;
        token.client = {id: token.client};

        dbUser.getUserByID(data.user, function (err, user) {

            token.user = user;

            dbDone = true;
        });
    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    return token;
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
    if (!token) {
        return false;
    }

    var isValid = true;

    isValid = isValid && token !== undefined;
    isValid = isValid && token.user !== undefined;
    isValid = isValid && token.user.id !== undefined;
    isValid = isValid && new Date(token.accessTokenExpiresAt) > new Date();


    return isValid;
}


module.exports = {
    //generateOAuthAccessToken, optional - used for jwt
    //generateAuthorizationCode: generateAuthorizationCode,
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