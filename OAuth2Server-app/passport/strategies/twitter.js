/**
 * Created by beuttlerma on 01.06.17.
 */

const TwitterStrategy = require('passport-twitter').Strategy;
const oAuthConfig = require('../../config/config_loader').OAUTH_PROVIDER;
const config = require('../../config/config_loader');
const logger = require('../../global/logger');
const dbUser = require('../../database/function/user');
const downloadService = require('../../services/download_service');
const oauthWrapper = require('../oauth_wrapper');

const oAuthProvider = 'twitter';

module.exports = function (passport) {
    logger.debug('Configure twitter oauth');

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey: oAuthConfig.twitterAuth.consumerKey,
            consumerSecret: oAuthConfig.twitterAuth.consumerSecret,
            callbackURL: oAuthConfig.twitterAuth.callbackURL,
            passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            includeEmail: true
        },
        function (req, token, tokenSecret, profile, done) {

            oauthWrapper.getToken(token, tokenSecret, oAuthProvider, done);

        }));
};