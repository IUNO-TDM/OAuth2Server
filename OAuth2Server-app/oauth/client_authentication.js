/**
 * Created by beuttlerma on 07.07.17.
 */


var oAuth = require('../oauth/oauth')('default');
var basicAuth = require('basic-auth');

var self = {};
self.http_auth = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }

    var user = basicAuth(req);

    console.log(req.headers);
    console.log(user);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    }

    if (oAuth.getClient(user.name, user.pass)) {
        return next();
    } else {
        return unauthorized(res);
    }
};

module.exports = self;