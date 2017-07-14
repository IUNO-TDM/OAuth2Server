/**
 * Created by beuttlerma on 14.07.17.
 */
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

var oauth = require('./oauth')('default');

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
            // Request is authorized.
            req.user = token;
            next()
        })
        .catch(function (err) {
            // Request is not authorized.
            res.status(err.code || 500).json(err)
        });
}
