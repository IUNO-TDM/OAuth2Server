/**
 * Created by beuttlerma on 14.07.17.
 */

/* ##########################################################################
 -- Author: Marcel Ely Gomes
 -- Company: Trumpf Werkzeugmaschine GmbH & Co KG
 -- CreatedAt: 2017-03-02
 -- Description: Routing service for TechnologyData
 -- ##########################################################################*/

var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var validate = require('express-jsonschema').validate;
var User = require('../database/model/user');


router.get('/:id', validate({query: require('../schema/users_schema').GetSingle}), function (req, res, next) {

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

router.get('/:id/image', validate({query: require('../schema/users_schema').GetSingle}), function (req, res, next) {

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

            var imgPath = user.imgpath;
            var path = require('path');

            if (imgPath && imgPath.length) {
                try {
                    return res.sendFile(path.resolve(imgPath));
                }
                catch (err) {
                    logger.warn(err);
                }
            }

            logger.info('No image found for user :  Sending default image instead');
            res.sendFile(path.resolve('images/default.svg'))
        }
    });

});
module.exports = router;