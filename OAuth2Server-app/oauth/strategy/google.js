/**
 * Created by beuttlerma on 04.07.17.
 */

var logger = require('../../global/logger');
var request = require('request');
var defaultStrategy = require('./default');

function getUserInfo(token) {

    var userInfo;
    request('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + token, function (err, response, body) {
        if (err) {
            logger.crit(err);
        }
        // logger.debug(response);
        logger.debug(body);

        userInfo = JSON.parse(body);
    });

    require('deasync').loopWhile(function(){return !userInfo;});

    return userInfo;
}

function getUser(id, token) {
    logger.info('getUser (google)');
    var userInfo = getUserInfo(token);


    if (userInfo.sub !== id) {
        return false;
    }

    //TODO: Check if user exists
    //TODO: Retrieve user uuid from the database

    var userExists = true;

    if (userExists) {
        return {
            ext_id: userInfo.sub,
            username: userInfo.email
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