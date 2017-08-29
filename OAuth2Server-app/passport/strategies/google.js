/**
 * Created by beuttlerma on 01.06.17.
 */

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const logger = require('../../global/logger');
const CONFIG = require('../../config/config_loader');
const oauthWrapper = require('../oauth_wrapper');

const oAuthProvider = 'google';

module.exports = function (passport) {
    logger.debug('Configure google oauth');

    if (!CONFIG.OAUTH_PROVIDER.googleAuth.clientID ||
        !CONFIG.OAUTH_PROVIDER.googleAuth.clientSecret ||
        !CONFIG.OAUTH_PROVIDER.googleAuth.callbackURL) {

        logger.warn('[strategies/google] Missing Google oAuth configuration');
        logger.warn('[strategies/google] Google oAuth was not configured');
        return;
    }


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    try {
        passport.use(new GoogleStrategy(CONFIG.OAUTH_PROVIDER.googleAuth,
            function (req, token, refreshToken, profile, done) {

                oauthWrapper.getToken(profile.id, token, oAuthProvider, done);
            }));

    } catch (err) {
        logger.warn(err);
        logger.warn('[strategies/google] Google oAuth was not configured');
    }

};