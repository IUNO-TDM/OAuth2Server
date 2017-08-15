/**
 * Created by beuttlerma on 02.06.17.
 */
var express = require('express');
var logger = require('../global/logger');

module.exports = function (passport) {
    var router = express.Router();

    // LOGOUT ==============================
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login.html');
    });


    // =============================================================================
    // AUTHENTICATE (GOOGLE) ==================================================
    // =============================================================================

    router.get('/google', function (req, res, next) {
        logger.info('google login');

        passport.authenticate('google', {
            scope: ['profile', 'email'],
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/google/callback', function (req, res, next) {
        logger.info('google callback');

        passport.authenticate('google', {
            successRedirect: '/console/console.html',
            failureRedirect: '/login.html',
            failureFlash: true
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (LOCAL) ==================================================
    // =============================================================================

    // process the login form
    router.post('/login', function (req, res, next) {
        logger.info('iuno login');

        const redirect_uri = req.body.redirect_uri;
        const response_type = req.body.response_type;
        const client_id = req.body.client_id;

        passport.authenticate('local-login', {
            successRedirect: redirect_uri,
            failureRedirect: redirect_uri,
            failureFlash: true
        })(req, res, next);
    });

    router.post('/signup', function (req, res, next) {
        logger.info('iuno signup');

        passport.authenticate('local-signup', {
            successRedirect: '/console/console.html',
            failureRedirect: '/login.html',
            failureFlash: true
        })(req, res, next);
    });


    return router;
};