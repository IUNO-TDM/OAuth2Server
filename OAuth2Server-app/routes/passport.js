/**
 * Created by beuttlerma on 02.06.17.
 */
var express = require('express');
var logger = require('../global/logger');

module.exports = function (passport) {
    var router = express.Router();

    // LOGOUT ==============================
    router.get('/logout', function (req, res) {
        logger.info('logout');

        req.logout();


        if(req.query['redirect']) {
            res.redirect(req.query['redirect']);
        }
        else {
            res.redirect('/login.html');
        }
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
            successRedirect: req.session.redirectTo || 'http://' + req.headers.host.split(':')[0] + ':3004',
            failureRedirect: '/login.html?failure=true',
            failureFlash: true
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (TWITTER) ==================================================
    // =============================================================================

    router.get('/twitter', function (req, res, next) {
        logger.info('twitter login');

        passport.authenticate('twitter', {
            scope: 'email',
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/twitter/callback', function (req, res, next) {
        logger.info('twitter callback');

        passport.authenticate('twitter', {
            successRedirect: req.session.redirectTo || 'http://' + req.headers.host.split(':')[0] + ':3004',
            failureRedirect: '/login.html?failure=true',
            failureFlash: true
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (FACEBOOK) ==================================================
    // =============================================================================

    router.get('/facebook', function (req, res, next) {
        logger.info('facebook login');

        passport.authenticate('facebook', {
            scope: ['email'],
            approvalPrompt: 'force'
        })(req, res, next);
    });

    router.get('/facebook/callback', function (req, res, next) {
        logger.info('facebook callback');

        passport.authenticate('facebook', {
            successRedirect: req.session.redirectTo || 'http://' + req.headers.host.split(':')[0] + ':3004',
            failureRedirect: '/login.html?failure=true',
            failureFlash: true
        })(req, res, next);
    });

    // =============================================================================
    // AUTHENTICATE (LOCAL) ==================================================
    // =============================================================================

    // process the login form
    router.post('/login', function (req, res, next) {
        logger.info('iuno login');

        passport.authenticate('local-login', {
            successRedirect: req.session.redirectTo || 'http://' + req.headers.host.split(':')[0] + ':3004',
            failureRedirect: '/login.html?failure=true'
        })(req, res, next);
    });

    router.post('/signup', function (req, res, next) {
        logger.info('iuno signup');

        passport.authenticate('local-signup', {
            successRedirect: req.session.redirectTo || 'http://' + req.headers.host.split(':')[0] + ':3004',
            failureRedirect: '/register.html?failure=true'
        })(req, res, next);
    });


    return router;
};