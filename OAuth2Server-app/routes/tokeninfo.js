/**
 * Created by beuttlerma on 07.07.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var validate = require('express-jsonschema').validate;
var oAuth = require('../oauth/oauth')('default');

router.get('/', validate({query: require('../schema/tokeninfo_schema')}), function (req, res, next) {

        var tokenInfo = oAuth.getAccessToken(req.query['access_token']);


        //TODO: Only return relevant token info
        res.json(tokenInfo);
    }
);

module.exports = router;