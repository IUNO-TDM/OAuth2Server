/**
 * Created by beuttlerma on 12.06.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    req.session.redirectTo = req.originalUrl;
    res.redirect('/login.html');
}


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
                return res.json({
                    access_token: token
                });
            }).catch(function (err) {
                logger.crit(err);
            return res.status(500);
        })
    }
);


router.get('/authorise', isLoggedIn, function (req, res) {

    var oAuth = require('../oauth/oauth')('default');

    req.headers['authorization'] = 'Bearer ' + req.user.token.accessToken;

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