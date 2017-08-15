/**
 * Created by beuttlerma on 01.06.17.
 */

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const logger = require('../../global/logger');
const config = require('../../config/config_loader');

const oAuthProvider = 'google';

const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const helper = require('../../services/helper_service');


function getToken(username, password, clientId, clientSecret, done) {

    const contentLength = helper.xwwwfurlenc({
        grant_type: 'password',
        username: username,
        password: password
    }).length;

    const options = {
        body: {
            grant_type: 'password',
            username: username,
            password: password
        },
        headers: {
            'authorization': 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64'),
            'content-type':'application/x-www-form-urlencoded',
            'content-length': contentLength
        },
        method: 'POST',
        query: {}
    };

    var oAuth = require('../../oauth/oauth')(oAuthProvider);
    var request = new Request(options);
    var response = new Response();

    oAuth
        .token(request, response)
        .then(function (token) {
            return done(null, {
                id: username,
                token: token
            });

        }).catch(function (err) {

        return done(err);
    })
}

module.exports = function (passport) {
    logger.debug('Configure google oauth');

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: config.OAUTH_PROVIDER.googleAuth.clientID,
            clientSecret: config.OAUTH_PROVIDER.googleAuth.clientSecret,
            callbackURL: config.OAUTH_PROVIDER.googleAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            getToken(profile.id, token, 'adb4c297-45bd-437e-ac90-9179eea41744', 'IsSecret', done);
        }));
};