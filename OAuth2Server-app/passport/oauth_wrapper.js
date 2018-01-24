const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const CONFIG = require('../config/config_loader');
const helper = require('../services/helper_service');
const logger = require('../global/logger');
const dbUser = require('../database/function/user');

const self = {};

self.getToken = function (email, password, strategy, done) {

    dbUser.getUser(email, password, function (err, user) {
        if (err) {
            return done(false);
        }

        if (!user.isVerified) {
            //Notify user that his account is not verified
            return done(false, null, {
                code: 'NOT_VERIFIED',
                message: 'Email address not verified.'
            });
        }

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
                'authorization': 'Basic ' + new Buffer(CONFIG.OAUTH_CREDENTIALS.CLIENT_ID + ':' + CONFIG.OAUTH_CREDENTIALS.CLIENT_SECRET).toString('base64'),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': contentLength
            },
            method: 'POST',
            query: {}
        };

        var oAuth = require('../oauth/oauth')(strategy);
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

            logger.warn(err);

            return done(err, null, {
                message: 'Could not retrieve token for user',
                code: 'LOGIN_FAILED'
            });
        })
    });

};

module.exports = self;