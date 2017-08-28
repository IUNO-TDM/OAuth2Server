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
const Twit = require('twit');

function verifyTwitterProfile(token, tokenSecret, callback) {

    var profile = false;

    const consumerKey = CONFIG.OAUTH_PROVIDER.twitterAuth.consumerKey;
    const consumerSecret = CONFIG.OAUTH_PROVIDER.twitterAuth.consumerSecret;


    // const twitter = new Twit({
    //     consumer_key: consumerKey,
    //     consumer_secret: consumerSecret,
    //     access_token: token,
    //     access_token_secret: tokenSecret,
    //     timeout_ms: 10 * 1000
    // });
    //
    // twitter.get('account/verify_credentials', {
    //     skip_status: true,
    //     include_entities: false,
    //     include_email: true
    // })
    //     .catch(function (err) {
    //         logger.crit(err);
    //         callback(err);
    //     })
    //     .then(function (result) {
    //         if (result && result.error) {
    //             logger.warn(result.error);
    //         }
    //
    //         if (result && result.data) {
    //             profile = result.data;
    //         }
    //
    //         callback(null, profile);
    //     });

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

    var profile = false;
    var twitterCallback = false;

    verifyTwitterProfile(token, tokenSecret, function (err, _profile) {
        if (!err && _profile) {
            profile = _profile;
        }

        twitterCallback = true;
    });

    require('deasync').loopWhile(function () {
        return !twitterCallback;
    });

    var user = null;
    var dbDone = false;
    dbUser.getUserByExternalID(profile.id_str, function (err, _user) {
        user = _user;

        if (err) {
            logger.warn(err);
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

                dbUser.SetUser(profile.id_str, profile.screen_name, profile.name, '',
                    profile.email, oauth2Provider, imagePath, null, [CONFIG.USER_ROLES.TD_OWNER], null, function (err, _user) {
                        if (err) {
                            logger.warn(err);
                        }

                        user = _user;
                        dbDone = true;
                    });
            });
        }
        else {
            dbDone = true;
        }
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