/**
 * Created by beuttlerma on 04.07.17.
 */
const logger = require('../../global/logger');
const dbToken = require('../../database/function/tokens');
const dbUser = require('../../database/function/user');
const dbClient = require('../../database/function/client');
const dbScope = require('../../database/function/scope');
const dbAuthorization = require('../../database/function/authorization');
const Promise = require('promise');

function getAccessToken(bearerToken) {
    logger.info('GetAccessToken', bearerToken);

    return new Promise(function (fulfill, reject) {
        dbToken.getAccessToken(bearerToken, function (err, token) {
            if (err) {
                logger.warn(err);
            }

            if (!token) {
                logger.warn('[oauth-default] Database did not return an access token');
                return fulfill(false);
            }

            dbUser.getUserByID(token.user, function (err, user) {
                if (err) {
                    logger.warn(err);
                }

                token.user = user;
                token.client = {
                    id: token.client
                };

                fulfill(token);
            });

        });
    });
}

function getClient(clientID, clientSecret) {
    logger.info('GetClient ', clientID);

    return new Promise(function (fulfill, reject) {
        if (clientSecret) {
            dbClient.getClient(clientID, clientSecret, function (err, data) {
                if (err) {
                    logger.warn(err);
                }
                return fulfill(data);
            });
        }
        else {
            dbClient.getClientById(clientID, function (err, data) {
                if (err) {
                    logger.warn(err);
                }
                return fulfill(data);
            });
        }
    });
}

function getUser(username, password) {
    logger.info('GetUser ', username);

    return new Promise(function (fulfill, reject) {
        dbUser.getUser(username, password, function (err, data) {
            if (err) {
                logger.warn(err);
                
            }
            return fulfill(data);
        });
    });
}

function revokeAuthorizationCode(code) {
    logger.info("revokeAuthorizationCode ", code);

    return new Promise(function (fulfill, reject) {
        dbToken.revokeAuthorizationCode(code.authorizationCode, function (err, data) {
            if (err) {
                logger.warn(err);

            }
            return fulfill(data);
        });
    });
}

function revokeToken(token) {
    logger.info("revokeToken", token);

    return new Promise(function (fulfill, reject) {
        dbToken.revokeToken(token.refreshToken, function (err, data) {
            if (err) {
                logger.warn(err);

            }
            return fulfill(data);
        });
    });
}

function saveToken(accessToken, client, user) {
    logger.info('SaveToken ', accessToken, client, user);

    return new Promise(function (fulfill, reject) {
        dbToken.saveToken(accessToken.accessToken, accessToken.accessTokenExpiresAt, accessToken.refreshToken,
            accessToken.refreshTokenExpiresAt, accessToken.scope,
            client.id, user.id, function (err, data) {
                if (err) {
                    logger.warn(err);

                }
                return fulfill(data);
            });
    });
}

function getAuthorizationCode(code) {
    logger.info('GetAuthorizationCode ', code);

    return new Promise(function (fulfill, reject) {
        dbAuthorization.getAuthorizationCode(code, function (err, code) {
            if (err) {
                logger.warn(err);

            }

            if (!code) {
                return fulfill(false);
            }

            dbUser.getUserByID(code.user, function (err, user) {
                if (err) {
                    logger.warn(err);

                }

                code.user = user;
                code.client = {
                    id: code.client
                };

                return fulfill(code);

            });
        });
    });
}

function saveAuthorizationCode(code, client, user) {
    logger.info('SaveAuthorizationCode ', code, client, user);

    return new Promise(function (fulfill, reject) {
        dbAuthorization.saveAuthorizationCode(code.authorizationCode, code.expiresAt, code.redirectUri, client.id, user.id, function (err, data) {
            if (err) {
                logger.warn(err);

            }
        });
        code.client = client;
        code.user = user;

        return fulfill(code);
    });
}

function getUserFromClient(client) {
    logger.info('GetUserFromClient ', client);

    return new Promise(function (fulfill, reject) {
        dbUser.getUserFromClient(client.id, function (err, data) {
            if (err) {
                logger.warn(err);

            }
            return fulfill(data);
        });

    });
}

function getRefreshToken(refreshToken) {
    logger.info('GetRefreshToken ', refreshToken);

    return new Promise(function(fulfill, reject) {
        dbToken.getRefreshToken(refreshToken, function (err, token) {
            if (err) {
                logger.warn(err);

            }

            token.client = {id: token.client};

            dbUser.getUserByID(token.user, function (err, user) {
                if (err) {
                    logger.warn(err);

                }

                token.user = user;

                return fulfill(token);
            });
        });
    });
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