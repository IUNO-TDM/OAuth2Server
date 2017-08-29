/**
 * Created by beuttlerma on 04.07.17.
 */

const logger = require('../../global/logger');
const request = require('request');
const defaultStrategy = require('./default');
const CONFIG = require('../../config/config_loader');
const dbUser = require('../../database/function/user');

const oauth2Provider = 'facebook';

function getAppAccessToken(callback) {
    const options = {
        url: CONFIG.OAUTH_ORIGINS.FACEBOOK_TOKEN_ENDPOINT,
        qs: {
            client_id: CONFIG.OAUTH_PROVIDER.facebookAuth.clientID,
            client_secret: CONFIG.OAUTH_PROVIDER.facebookAuth.clientSecret,
            grant_type: 'client_credentials'
        },
        json: true
    };

    request(options, function (err, res, body) {
        if (err) {
            logger.warn(err);
        }

        if (body && body.access_token) {
            return callback(null, body.access_token);
        }

        return callback(err, null);
    });
}

function verifyAccessToken(inputToken, callback) {
    getAppAccessToken(function (err, accessToken) {

        if (!accessToken) {
            return callback(err, null);
        }

        const options = {
            url: CONFIG.OAUTH_ORIGINS.FACEBOOK_TOKEN_INFO,
            qs: {
                input_token: inputToken,
                access_token: accessToken
            },
            json: true
        };

        request(options, function (err, res, body) {
            var tokenInfo = null;

            if (err) {
                logger.warn(err);
            }

            if (body && body.data) {
                tokenInfo = body.data;
            }

            callback(err, tokenInfo);
        });
    });


}

function getUser(extId, token) {
    logger.info('getUser (facebook)');

    var facebookCallback = false;
    var isValid = true;

    verifyAccessToken(token, function (err, tokenInfo) {
        if (err || !tokenInfo) {
            isValid = false;
        }

        if (CONFIG.ALLOWED_CLIENT_IDS.indexOf(tokenInfo.app_id) < 0) {
            logger.warn('[strategy/facebook] ' + tokenInfo.app_id + ' is not a known Facebook oAuth Client. (Check config file)');
            isValid = false;
        }

        if (tokenInfo.user_id !== extId) {
            logger.warn('[strategy/facebook] User id linked to token does not match the user id sent by the client.')

            isValid = false;
        }

        facebookCallback = true;
    });

    require('deasync').loopWhile(function () {
        return !facebookCallback;
    });

    if (!isValid) {
        return false;
    }

    var user = false;
    var dbDone = false;

    dbUser.getUserByExternalID(extId, function (err, _user) {
        user = _user;

        if (err) {
            logger.warn(err);
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