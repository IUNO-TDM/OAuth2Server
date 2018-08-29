/**
 * Created by beuttlerma on 07.07.17.
 */


const oAuth = require('../oauth/strategy/default');
const basicAuth = require('basic-auth');


module.exports = function (req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }

    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    }

    oAuth.getClient(user.name, user.pass).then((client) => {
        if (client) {

            return next();
        } else {
            return unauthorized(res);
        }
    });

};