/**
 * Created by beuttlerma on 14.07.17.
 */

/* ##########################################################################
 -- Author: Marcel Ely Gomes
 -- Company: Trumpf Werkzeugmaschine GmbH & Co KG
 -- CreatedAt: 2017-03-02
 -- Description: Routing service for TechnologyData
 -- ##########################################################################*/

const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const User = require('../database/model/user');
const path = require('path');
const fs = require('fs');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/users_schema');

router.get('/:id', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {

    User.FindSingle(req.params['id'], function (err, user) {
        if (err) {
            next(err);
        }
        else {

            //Check if user is requesting his own information or the information of a foreign user
            if (req.user.user.id !== req.params['id']) {
                return res.json(user.getPublicData());
            }

            return res.json(user.getPrivateData());
        }
    });
});

router.get('/:id/image', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {

    User.FindSingle(req.params['id'], function (err, user) {
        if (err) {
            next(err);
        }
        else {
            if (!user || !Object.keys(user).length) {
                logger.info('No user found for id: ' + req.param['id']);
                res.sendStatus(404);

                return;
            }

            let imgPath = user.imgpath;
            if (imgPath && imgPath.length) {
                imgPath = path.resolve(imgPath);
                logger.debug('[users] User img path: ' + imgPath);
                if (fs.existsSync(imgPath)) {
                    return res.sendFile(imgPath);
                }
            }

            logger.info('No image found for user :  Sending default image instead');
            res.sendFile(path.resolve('images/default.svg'))
        }
    });

});
module.exports = router;