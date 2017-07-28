/**
 * Created by beuttlerma on 04.07.17.
 */

var logger = require('../../global/logger');
var request = require('request');
var defaultStrategy = require('./default');
var config = require('../../config/config_loader');
var dbUser = require('../../database/function/user');
var oauth2Provider = 'google';
var helper = require('../../services/helper_service');
var downloadService = require('../../services/download_service');

function getUserAndTokenInfo(token) {

    var userInfo;
    var tokenInfo;

    request(config.OAUTH_ORIGINS.GOOGLE_USER_INFO + '?access_token=' + token, function (err, response, body) {
        if (err) {
            logger.crit(err);
        }
        // logger.debug(response);
        logger.debug(body);

        userInfo = JSON.parse(body);
    });

    request(config.OAUTH_ORIGINS.GOOGLE_TOKEN_INFO + '?access_token=' + token, function (err, response, body) {
        if (err) {
            logger.crit(err);
        }
        // logger.debug(response);
        logger.debug(body);

        tokenInfo = JSON.parse(body);
    });

    require('deasync').loopWhile(function () {
        return !userInfo || !tokenInfo;
    });


    return {
        userInfo: userInfo,
        tokenInfo: tokenInfo
    };
}

function getUser(id, token) {
    logger.info('getUser (google)');
    var dict = getUserAndTokenInfo(token);


    if (dict.userInfo.sub !== id) {
        return false;
    }

    //Check if the token was requested by one of our trusted clients
    //aud 	always 	Identifies the audience that this ID token is intended for. It must be one of the OAuth 2.0 client IDs of your application.
    if (config.ALLOWED_CLIENT_IDS.indexOf(dict.tokenInfo.aud) < 0) {
        return false
    }

    var user;
    var dbDone;
    dbUser.getUserByExternalID(id, function (err, _user) {
        user = _user;
        dbDone = true;
    });

    require('deasync').loopWhile(function () {
        return !dbDone;
    });

    if (!user) {
        downloadService.downloadImageFromUrl(dict.userInfo.picture, function(err, filePath) {
            var imagePath = '';

            if (!err) {
                imagePath = filePath;
            }

            dbUser.SetUser(dict.userInfo.sub, dict.userInfo.name, dict.userInfo.given_name, dict.userInfo.family_name,
                dict.userInfo.email, oauth2Provider, imagePath, null, config.USER_ROLE, null, function (err, _user) {
                    user = _user;
                });
        });
    }

    require('deasync').loopWhile(function () {
        return !user;
    });

    return user;
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
    saveAuthorizationCode: defaultStrategy.saveAuthorizationCode,
    validateScope: defaultStrategy.validateScope,
    verifyScope: defaultStrategy.verifyScope
};