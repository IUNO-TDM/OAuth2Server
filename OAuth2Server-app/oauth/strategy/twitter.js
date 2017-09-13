/**
 * Created by beuttlerma on 04.07.17.
 */

const logger = require('../../global/logger');
const request = require('request');
const defaultStrategy = require('./default');
const CONFIG = require('../../config/config_loader');
const dbUser = require('../../database/function/user');
const oauth2Provider = 'twitter';
const downloadService = require('../../services/download_service');
const Promise = require('promise');

function verifyTwitterProfile(token, tokenSecret, callback) {

    const consumerKey = CONFIG.OAUTH_PROVIDER.twitterAuth.consumerKey;
    const consumerSecret = CONFIG.OAUTH_PROVIDER.twitterAuth.consumerSecret;

    const options = {
        url: CONFIG.OAUTH_ORIGINS.TWITTER_PROFILE_INFO,
        qs: {
            skip_status: true,
            include_entities: false,
            include_email: true
        },
        oauth: {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            token: token,
            token_secret: tokenSecret
        },
        json: true
    };

    request(options, function (err, res, body) {
        if (err) {
            logger.warn(err);
        }


        callback(err, body);
    });

}

function getUser(token, tokenSecret) {
    logger.info('getUser (twitter)');

    return new Promise(function (fulfill, reject) {
        verifyTwitterProfile(token, tokenSecret, function (err, profile) {
            if (err && !profile) {
                logger.warn(err);
                return fulfill(false);
            }

            dbUser.getUserByExternalID(profile.id_str, oauth2Provider, function (err, user) {
                if (err) {
                    logger.warn(err);
                }

                if (user) {
                    downloadService.updateUserImage(profile.profile_image_url, user.imgpath);
                    return fulfill(user);
                }
                if (!user) {
                    downloadService.downloadImageFromUrl(profile.profile_image_url, function (err, filePath) {
                        var imagePath = '';

                        if (err) {
                            logger.warn(err);
                        }

                        if (!err) {
                            imagePath = filePath;
                        }

                        dbUser.SetUser(profile.id_str, profile.screen_name, profile.name.split(' ')[0], profile.name.split(' ')[1],
                            profile.email, oauth2Provider, imagePath, null, [CONFIG.USER_ROLES.TD_OWNER], null, function (err, _user) {
                                if (err) {
                                    logger.warn(err);
                                }

                                return fulfill(_user);
                            });
                    });
                }
            });
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