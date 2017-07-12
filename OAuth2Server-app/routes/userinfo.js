/**
 * Created by beuttlerma on 12.07.17.
 */

var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var validate = require('express-jsonschema').validate;
var oAuth = require('../oauth/strategy/default');
var dbUser = require('../database/function/user');
var helper = require('../services/helper_service');

router.get('/', validate({query: require('../schema/userinfo_schema')}), function (req, res, next) {

        var tokenInfo = oAuth.getAccessToken(req.query['accessToken']);

        //Validate token
        if (!oAuth.validateToken(tokenInfo)) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }

        dbUser.getUserByID(tokenInfo.useruuid, function (err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.sendStatus(404);
            }

            res.json(user);
        });
    }
);

module.exports = router;