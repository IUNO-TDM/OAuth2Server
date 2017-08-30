/**
 * Created by beuttlerma on 07.07.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var validate = require('express-jsonschema').validate;
var oAuth = require('../oauth/strategy/default');

router.get('/', validate({query: require('../schema/tokeninfo_schema')}), function (req, res, next) {

        oAuth.getAccessToken(req.query['access_token']).then(function(tokenInfo) {
            res.json(tokenInfo);
        }).catch(function(err) {
            next(err);
        });
    }
);

module.exports = router;