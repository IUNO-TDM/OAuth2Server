/**
 * Created by beuttlerma on 14.07.17.
 */
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var helper = require('../services/helper_service');
var oauth = require('./oauth')('default');

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Bearer realm=OAUTH Token required');
    return res.sendStatus(401);
}

module.exports = function (req, res, next) {
    var request = new Request({
        headers: {authorization: req.headers.authorization},
        method: req.method,
        query: req.query,
        body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, {})
        .then(function (token) {
            if (!token || helper.isArray(token)) {
                return unauthorized(res);
            }
            req.user = token;
            next()
        })
        .catch(function (err) {
            // Request is not authorized.
            res.status(err.code || 500).json(err)
        });
}
