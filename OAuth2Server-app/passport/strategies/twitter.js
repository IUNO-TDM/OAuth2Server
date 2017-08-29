/**
 * Created by beuttlerma on 01.06.17.
 */

const TwitterStrategy = require('passport-twitter').Strategy;
const oAuthConfig = require('../../config/config_loader').OAUTH_PROVIDER;
const CONFIG = require('../../config/config_loader');
const logger = require('../../global/logger');
const oauthWrapper = require('../oauth_wrapper');

const oAuthProvider = 'twitter';

module.exports = function (passport) {
    logger.debug('Configure twitter oauth');

    if (!CONFIG.OAUTH_PROVIDER.twitterAuth.consumerKey ||
        !CONFIG.OAUTH_PROVIDER.twitterAuth.consumerSecret) {

        logger.warn('[strategies/twitter] Missing Twitter oAuth configuration');
        logger.warn('[strategies/twitter] Twitter oAuth was not configured');

        return;
    }

    try {
        passport.use(new TwitterStrategy(oAuthConfig.twitterAuth,
            function (req, token, tokenSecret, profile, done) {

                oauthWrapper.getToken(token, tokenSecret, oAuthProvider, done);

            }));
    }
    catch(err) {
        logger.warn(err);
        logger.warn('[strategies/twitter] Twitter oAuth was not configured');
    }
};