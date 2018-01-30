/**
 * Created by beuttlerma on 01.06.17.
 */

const LocalStrategy = require('passport-local').Strategy;
const logger = require('../../global/logger');
const oauthWrapper = require('../oauth_wrapper');
const emailService = require('../../services/email_service');
const User = require('../../database/model/user');
const CONFIG = require('../../config/config_loader');

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

            oauthWrapper.getToken(email, password, 'default', done);
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
                    email,
                    'iuno',
                    null,
                    null,
                    null,
                    password,
                    [CONFIG.USER_ROLES.TD_OWNER]
                );

                user.Create(function (err) {
                    if (err) {
                        return done(err, null, {
                            code: 'CREATE_USER_ERR',
                            message: 'Registration failed. Username maybe already used.'
                        });
                    }

                    emailService.sendVerificationMailForUser(user);

                    return done(false, null, {
                        code: 'VERIFICATION_REQUIRED',
                        message: 'Email Verification Required'
                    });
                });
            });

        }));
};