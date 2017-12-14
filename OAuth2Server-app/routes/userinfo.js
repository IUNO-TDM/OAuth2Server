/**
 * Created by beuttlerma on 12.07.17.
 */

const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const oAuth = require('../oauth/strategy/default');
const User = require('../database/model/user');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/userinfo_schema');

router.get('/', validate({
    query: validation_schema.UserInfo_Query,
    body: validation_schema.Empty
}), function (req, res, next) {

        oAuth.getAccessToken(req.query['access_token']).then(function(tokenInfo) {
            //Validate token
            if (!oAuth.validateToken(tokenInfo)) {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.sendStatus(401);
            }

            User.FindSingle(tokenInfo.user.id, function (err, user) {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    return res.sendStatus(404);
                }

                res.json(user.getPrivateData());
            });
        }).catch(function(err){
            next(err);
        });
    }
);

module.exports = router;