/**
 * Created by beuttlerma on 01.06.17.
 */

const LocalStrategy = require('passport-local').Strategy;
const logger = require('../../global/logger');

const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const User = require('../../database/model/user');
const CONFIG = require('../../config/config_loader');

const helper = require('../../services/helper_service');

function getToken(email, password, clientId, clientSecret, done) {

    const contentLength = helper.xwwwfurlenc({
        grant_type: 'password',
        username: email,
        password: password
    }).length;

    const options = {
        body: {
            grant_type: 'password',
            username: email,
            password: password
        },
        headers: {
            'authorization': 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64'),
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': contentLength
        },
        method: 'POST',
        query: {}
    };

    var oAuth = require('../../oauth/oauth')('default');
    var request = new Request(options);
    var response = new Response();

    oAuth
        .token(request, response)
        .then(function (token) {
            return done(null, {
                id: email,
                token: token
            });

        }).catch(function (err) {

        return done(err);
    })
}

function authorise(req, done) {
    var oAuth = require('../../oauth/oauth')('default');
    var request = new Request(req);
    var response = new Response();


    oAuth.authorize(request, response).then(function (success) {
        logger.log(success);
    }).catch(function (err) {
        logger.log(err);
    })

}

module.exports = function (passport) {
    logger.debug('Configure user/pwd auth');

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email) {
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            }

            req.body.username = email;

            authorise(req);
        }));


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            if (email) {
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            }

            // asynchronous
            process.nextTick(function () {

                const user = new User(
                    null,
                    email,
                    null,
                    req.body.first_name,
                    req.body.last_name,
                    req.body.email,
                    'iuno',
                    null,
                    null,
                    null,
                    password,
                    [CONFIG.USER_ROLES.TD_OWNER]
                );

                user.Create(function (err) {
                    if (err) {
                        return done(null, false, {message: 'Registration failed. Username maybe already used.'});
                    }

                    getToken(email, password, 'adb4c297-45bd-437e-ac90-9179eea41744', 'IsSecret', done);
                });
            });

        }));
};