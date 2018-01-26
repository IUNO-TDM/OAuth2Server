/**
 * Created by beuttlerma on 02.06.17.
 */
const express = require('express');
const logger = require('../global/logger');

const dbUser = require('../database/function/user');
const captchaAdapter = require('../adapter/recaptcha_adapter');
const emailService = require('../services/email_service');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/passport_schema');

module.exports = function (passport) {
    const router = express.Router();

    // LOGOUT ==============================
    router.get('/logout', validate({
        query: validation_schema.Logout_Query,
        body: validation_schema.Empty
    }), function (req, res) {
        logger.info('logout');

        req.logout();

        if (req.query['redirect']) {
            res.redirect(req.query['redirect']);
        }
        else {
            res.redirect('/login.html');
        }
    });


    // =============================================================================
    // AUTHENTICATE (GOOGLE) ==================================================
    // =============================================================================

    router.get('/google', validate({
        query: validation_schema.Empty,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('google login');

        passport.authenticate('google', {
            scope: ['profile', 'email'],
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/google/callback', validate({
        query: validation_schema.GoogleCallback_Query,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('google callback');

        passport.authenticate('google', {
            successRedirect: req.session.redirectTo || 'https://iuno.axoom.cloud',
            failureRedirect: '/login.html'
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (TWITTER) ==================================================
    // =============================================================================

    router.get('/twitter', validate({
        query: validation_schema.Empty,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('twitter login');

        passport.authenticate('twitter', {
            scope: 'email',
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/twitter/callback', validate({
        query: validation_schema.TwitterCallback_Query,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('twitter callback');

        passport.authenticate('twitter', {
            successRedirect: req.session.redirectTo || 'https://iuno.axoom.cloud',
            failureRedirect: '/login.html'
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (FACEBOOK) ==================================================
    // =============================================================================

    router.get('/facebook', validate({
        query: validation_schema.Empty,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('facebook login');

        passport.authenticate('facebook', {
            scope: ['email'],
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/facebook/callback', validate({
        query: validation_schema.FacebookCallback_Query,
        body: validation_schema.Empty
    }), function (req, res, next) {
        logger.info('facebook callback');

        passport.authenticate('facebook', {
            successRedirect: req.session.redirectTo || 'https://iuno.axoom.cloud',
            failureRedirect: '/login.html'
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (LOCAL) ==================================================
    // =============================================================================

    // process the login form
    router.post('/login', validate({
        query: validation_schema.PassportLogin_Query,
        body: validation_schema.PassportLogin_Body
    }), function (req, res, next) {
        logger.info('iuno login');

        passport.authenticate('local-login', function (err, user, info) {

            if (err && info && info.code) {
                return res.redirect('/login?failure=' + info.code || 'true');
            }

            if (!err && user) {
                req.logIn(user, function(err) {
                    if (err) {
                        return res.redirect('/login?failure=true');
                    }

                    return res.redirect(req.session.redirectTo || 'https://iuno.axoom.cloud')
                });
            }

            if (info) {
                return res.redirect('/login?failure=' + info.code || 'true');
            }

            return res.redirect('/login?failure=true');

        })(req, res, next);
    });

    router.post('/signup', validate({
        query: validation_schema.PassportSignup_Query,
        body: validation_schema.PassportSignup_Body
    }), function (req, res, next) {
        logger.info('iuno signup');

        const captchaResponse = req.body['g-recaptcha-response'];

        captchaAdapter.verifyReCaptchaResponse(captchaResponse, function (err, success) {
            if (err || !success) {
                res.redirect('/register?failure=captcha');
            } else { // captcha success
                passport.authenticate('local-signup', function (err, user, info) {

                    if (err && info && info.code) {
                        return res.redirect('/register?failure=' + info.code || 'true');
                    }

                    if (!err && !user && info && info.code === 'VERIFICATION_REQUIRED') {
                        return res.redirect('/register?success');
                    }

                    return res.redirect('/register?failure=true');

                })(req, res, next);
            }
        });
    });

    router.get('/verify', validate({
        query: validation_schema.Verify_Query,
        body: validation_schema.Empty
    }), function (req, res, next) {

        dbUser.getUserByID(req.query['user'], function (err, user) {
            if (err || !user || user.isVerified) {
                return res.sendStatus(400);
            }

            dbUser.VerifyUser(req.query['user'], req.query['key'], function (err, success) {
                if (!success) {
                    return res.sendStatus(400);
                }

                return res.redirect('login.html');
            });
        });
    });

    router.post('/resend_registration_email', validate({
        query: validation_schema.Empty,
        body: validation_schema.Resend_Email_Body
    }), function (req, res, next) {

        const captchaResponse = req.body['g-recaptcha-response'];

        captchaAdapter.verifyReCaptchaResponse(captchaResponse, function (err, success) {
            if (err || !success) {
                logger.warn('[routes/users] Invalid google captcha response');
                return res.redirect('/resend-email-verification?failure=captcha');
            } else { // captcha success

                const email = req.body['email'];
                const password = req.body['password'];
                dbUser.getUser(email, password, function (err, user) {
                    if (!user) {
                        logger.warn('[routes/users] Registration email for unknown user (' + email + ') requested.');
                        return res.redirect('/resend-email-verification?failure=unknown_user');
                        // return res.sendStatus(400);
                    }

                    if (user.isVerified) {
                        logger.warn('[routes/users] User (' + email + ') already verified.');
                        return res.redirect('/resend-email-verification?failure=already_verified');
                        // return res.sendStatus(400);
                    }

                    emailService.sendVerificationMailForUser(user);

                    return res.redirect('/resend-email-verification?success=true');
                });

            }
        });
    });


    return router;
};