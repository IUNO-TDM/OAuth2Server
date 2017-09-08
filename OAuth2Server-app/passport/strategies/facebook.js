/**
 * Created by beuttlerma on 01.06.17.
 */

const FacebookStrategie = require('passport-facebook').Strategy;
const oAuthConfig = require('../../config/config_loader').OAUTH_PROVIDER;
const CONFIG = require('../../config/config_loader');
const logger = require('../../global/logger');
const oauthWrapper = require('../oauth_wrapper');
const dbUser = require('../../database/function/user');
const downloadService = require('../../services/download_service');

const oAuthProvider = 'facebook';

module.exports = function (passport) {
    logger.debug('Configure facebook oauth');

    if (!CONFIG.OAUTH_PROVIDER.facebookAuth.clientID ||
        !CONFIG.OAUTH_PROVIDER.facebookAuth.clientSecret){

        logger.warn('[strategies/facebook] Missing Facebook oAuth configuration');
        logger.warn('[strategies/facebook] Facebook oAuth was not configured');

        return;
    }
    try {
        passport.use(new FacebookStrategie(oAuthConfig.facebookAuth,
            function (req, accessToken, refreshToken, profile, done) {

                var userEmail = profile.id + '@' + oAuthProvider + '.iuno';

                if (profile.emails && profile.emails.length) {
                    userEmail = profile.emails[0].value;
                }

                // Check if user account already exists in our system
                dbUser.getUserByExternalID(profile.id + '', oAuthProvider, function (err, user) {
                    if (err) {
                        logger.warn(err);
                    }

                    // If not: Download the profile image and create a user account
                    if (!user) {
                        var profileImageUrl = null;
                        if (profile.photos && profile.photos.length) {
                            profileImageUrl = profile.photos[0].value;
                        }

                        downloadService.downloadImageFromUrl(profileImageUrl, function (err, filePath) {
                            var imagePath = '';

                            if (err) {
                                logger.warn(err);
                            }

                            if (!err) {
                                imagePath = filePath;
                            }

                            dbUser.SetUser(profile.id + '', profile.name.givenName, profile.name.givenName, profile.name.familyName,
                                userEmail, oAuthProvider, imagePath, null, [CONFIG.USER_ROLES.TD_OWNER], null, function (err, _user) {
                                    if (err) {
                                        logger.warn(err);
                                    }

                                    oauthWrapper.getToken(profile.id, accessToken, oAuthProvider, done);
                                });
                        });
                    }
                    else {
                        oauthWrapper.getToken(profile.id, accessToken, oAuthProvider, done);
                    }
                });

            }));
    }
    catch(err) {
        logger.warn(err);
        logger.warn('[strategies/facebook] Facebook oAuth was not configured');
    }


};