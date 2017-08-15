/**
 * Created by beuttlerma on 12.06.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var validate = require('express-jsonschema').validate;


router.all('/token', function (req, res, next) {
        var oauthStrategy = req.body.oauth_provider;

        if (!oauthStrategy) {
            oauthStrategy = 'default';
        }


        var oAuth = require('../oauth/oauth')(oauthStrategy);

        var request = new Request(req);
        var response = new Response(res);

        oAuth
            .token(request, response)
            .then(function (token) {
                // Todo: remove unnecessary values in response
                return res.json(token)
            }).catch(function (err) {
            return res.status(500).json(err)
        })
    }
);


router.get('/authorise', function (req, res) {

    var oAuth = require('../oauth/oauth')('default');
    // req.headers['Authorization'] = 'Bearer 7087f678650a34095983536d2eb58ae475bfa700';
    var request = new Request(req);
    var response = new Response(res);


    return oAuth.authorize(request, response, {
        allowEmptyState: true
    }).then(function (data) {
        //  if (req.body.allow !== 'true') return callback(null, false);
        //  return callback(null, true, req.user);
        res.redirect(data.redirectUri + '?code=' + data.authorizationCode)
    }).catch(function (err) {
        res.status(err.code || 500).json(err)
    })
});

module.exports = router;