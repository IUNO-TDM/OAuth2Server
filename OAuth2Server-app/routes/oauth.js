/**
 * Created by beuttlerma on 12.06.17.
 */
const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/oauth_schema');


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login.html');
}


router.all('/token', validate({
        query: validation_schema.Empty,
        body: validation_schema.Token_Body
    }), function (req, res, next) {
        let oauthStrategy = req.body.oauth_provider;

        if (!oauthStrategy) {
            oauthStrategy = 'default';
        }

        const oAuth = require('../oauth/oauth')(oauthStrategy);

        const request = new Request(req);
        const response = new Response(res);

        oAuth
            .token(request, response, {
                refreshTokenLifetime: 3600 * 24,
                alwaysIssueNewRefreshToken: false
            })
            .then(function (token) {
                if (!token) {
                    return res.sendStatus(401);
                }

                return res.json({
                    access_token: token
                });
            }).catch(function (err) {
            logger.crit(err);
            return res.sendStatus(401);
        })
    }
);


router.get('/authorise', isLoggedIn, validate({
    query: validation_schema.Authorise_Query,
    body: validation_schema.Empty
}), function (req, res, next) {

    const oAuth = require('../oauth/oauth')('default');

    req.headers['authorization'] = 'Bearer ' + req.user.token.accessToken;

    const request = new Request(req);
    const response = new Response(res);

    return oAuth.authorize(request, response, {
        allowEmptyState: true
    }).then(function (data) {
        res.redirect(data.redirectUri + '?code=' + data.authorizationCode)
    }).catch(function (err) {
        logger.crit(err);
        req.logout();

        return res.redirect('/login.html');
    })
});

module.exports = router;