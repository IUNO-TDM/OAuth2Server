/**
 * Created by beuttlerma on 04.07.17.
 */

var logger = require('../../global/logger');
var request = require('request');
var defaultStrategy = require('./default');
var config = require('../../config/config_loader');

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
    console.log(config.ALLOWED_CLIENT_IDS.indexOf(dict.tokenInfo.aud));
    if (config.ALLOWED_CLIENT_IDS.indexOf(dict.tokenInfo.aud) < 0) {
        return false
    }

    //TODO: Check if user exists
    //TODO: Retrieve user uuid from the database

    var userExists = true;

    if (userExists) {
        return {
            ext_id: dict.userInfo.sub,
            username: dict.userInfo.email
        }
    }
    else {
        //TODO: Create new user with token info and return new user
    }

    return false;
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
    verifyScope: defaultStrategy.verifyScope,
}