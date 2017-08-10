/**
 * Created by beuttlerma on 04.07.17.
 */

const logger = require('../../global/logger');
const defaultStrategy = require('./default');
const config = require('../../config/config_loader');
const dbUser = require('../../database/function/user');

function getUser(email, password) {
    logger.info('getUser (iuno)');

    var user = null;
    var dbDone = false;
    dbUser.getUser(email, password, function (err, _user) {
        user = _user;

        if (err) {
            logger.warn(err);
        }

        if (!user) {
            user = false;
        }

        dbDone = true;
    });


    require('deasync').loopWhile(function () {
        return !dbDone;
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
    saveAuthorizationCode: defaultStrategy.saveAuthorizationCode
};