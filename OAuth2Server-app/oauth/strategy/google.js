/**
 * Created by beuttlerma on 04.07.17.
 */

const logger = require('../../global/logger');
const request = require('request');
const defaultStrategy = require('./default');
const config = require('../../config/config_loader');
const dbUser = require('../../database/function/user');
const oauth2Provider = 'google';
const downloadService = require('../../services/download_service');
const Promise = require('promise');

function getUserAndTokenInfo(token) {

    return new Promise(function (fulfill, reject) {
        Promise.all([
            new Promise(function (fulfill, reject) {
                request(config.OAUTH_ORIGINS.GOOGLE_USER_INFO + '?access_token=' + token, function (err, response, body) {
                    if (err) {
                        logger.crit(err);
                    }

                    const userInfo = JSON.parse(body);

                    return fulfill(userInfo);
                });
            }),
            new Promise(function (fulfill, reject) {
                request(config.OAUTH_ORIGINS.GOOGLE_TOKEN_INFO + '?access_token=' + token, function (err, response, body) {
                    if (err) {
                        logger.crit(err);
                    }
                    // logger.debug(response);
                    logger.debug(body);

                    const tokenInfo = JSON.parse(body);

                    return fulfill(tokenInfo);
                });
            })
        ]).then(function (result) {
            return fulfill({
                userInfo: result[0],
                tokenInfo: result[1]
            });
        }).catch(function (err) {
            return reject(err);
        });
    });

}

function getUser(id, token) {
    logger.info('getUser (google)');

    return new Promise(function (fulfill, reject) {
        getUserAndTokenInfo(token)
            .then(function (dict) {
                if (dict.userInfo.sub !== id) {
                    return false;
                }

                //Check if the token was requested by one of our trusted clients
                //aud 	always 	Identifies the audience that this ID token is intended for. It must be one of the OAuth 2.0 client IDs of your application.
                if (config.ALLOWED_CLIENT_IDS.indexOf(dict.tokenInfo.aud) < 0) {
                    logger.warn('[strategy/google] ' + dict.tokenInfo.aud + ' is not a known Google oAuth Client. (Check config file)');
                    return false
                }

                var user = null;
                dbUser.getUserByExternalID(id, function (err, _user) {
                    user = _user;

                    if (err) {
                        logger.warn(err);
                    }

                    if (user) {
                        return fulfill(user);
                    }

                    if (!user) {
                        downloadService.downloadImageFromUrl(dict.userInfo.picture, function (err, filePath) {
                            var imagePath = '';

                            if (err) {
                                logger.warn(err);
                            }

                            if (!err) {
                                imagePath = filePath;
                            }

                            dbUser.SetUser(dict.userInfo.sub, dict.userInfo.name, dict.userInfo.given_name, dict.userInfo.family_name,
                                dict.userInfo.email, oauth2Provider, imagePath, null, [config.USER_ROLES.TD_OWNER], null, function (err, _user) {
                                    if (err) {
                                        logger.warn(err);
                                    }

                                    return fulfill(_user);
                                });
                        });
                    }
                });
            }).catch(function (err) {
                return reject(err);
        });
    });
}


module.exports = {
    //generateOAuthAccessToken, optional - used for jwt
    //generateAuthorizationCode, optional
    //generateOAuthRefreshToken, - optional
    getAccessToken: defaultStrategy.getAccessToken,
    getAuthorizationCode: defaultStrategy.getAuthorizationCode,
    getClient: defaultStrategy.getClient,
    getRefreshToken: defaultStrategy.getRefreshToken,
    getUser: getUser,
    getUserFromClient: defaultStrategy.getUserFromClient,
    //grantTypeAllowed, Removed in oauth2-server 3.0
    revokeAuthorizationCode: defaultStrategy.revokeAuthorizationCode,
    revokeToken: defaultStrategy.revokeToken,
    saveToken: defaultStrategy.saveToken,
    saveAuthorizationCode: defaultStrategy.saveAuthorizationCode
};