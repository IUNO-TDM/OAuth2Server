/**
 * Created by beuttlerma on 07.07.17.
 */


var oAuth = require('../oauth/strategy/default');
var basicAuth = require('basic-auth');


module.exports = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    }

    if (oAuth.getClient(user.name, user.pass)) {
        return next();
    } else {
        return unauthorized(res);
    }
};