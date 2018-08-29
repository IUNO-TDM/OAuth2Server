/**
 * Created by beuttlerma on 14.07.17.
 */
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const helper = require('../services/helper_service');
const oauth = require('./oauth')('default');

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Bearer realm=OAUTH Token required');
    return res.sendStatus(401);
}

module.exports = function (req, res, next) {
    const request = new Request({
        headers: {authorization: req.headers.authorization},
        method: req.method,
        query: req.query,
        body: req.body
    });
    const response = new Response(res);

    oauth.authenticate(request, response, {})
        .then(function (token) {
            let authorized = false;

            if (token && !helper.isArray(token) && token.user) {
                // Only allow access to MachineOperators and TechnologyDataOwner
                if (token.user.roles.indexOf('MachineOperator') >= 0) {
                    authorized = true;
                }
                if (token.user.roles.indexOf('TechnologyDataOwner') >= 0) {
                    authorized = true;
                }
            }


            if (authorized) {
                req.user = token;
                next()
            }
            else {
                unauthorized(res);
            }
        })
        .catch(function (err) {
            // Request is not authorized.
            res.status(err.code || 500).json(err)
        });
}
