/**
 * Created by beuttlerma on 01.06.17.
 */

const TwitterStrategy = require('passport-twitter').Strategy;
const oAuthConfig = require('../../config/config_loader').OAUTH_PROVIDER;
const config = require('../../config/config_loader');
const logger = require('../../global/logger');
const oauthWrapper = require('../oauth_wrapper');

const oAuthProvider = 'twitter';

module.exports = function (passport) {
    logger.debug('Configure twitter oauth');

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new TwitterStrategy(oAuthConfig.twitterAuth,
        function (req, token, tokenSecret, profile, done) {

            oauthWrapper.getToken(token, tokenSecret, oAuthProvider, done);

        }));
};