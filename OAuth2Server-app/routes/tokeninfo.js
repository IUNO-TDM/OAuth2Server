/**
 * Created by beuttlerma on 07.07.17.
 */
const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const oAuth = require('../oauth/strategy/default');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/tokeninfo_schema');

router.get('/', validate({
    query: validation_schema.TokenInfo_Query,
    body:  validation_schema.Empty
}), function (req, res, next) {

        oAuth.getAccessToken(req.query['access_token']).then(function(tokenInfo) {
            res.json(tokenInfo);
        }).catch(function(err) {
            next(err);
        });
    }
);

module.exports = router;