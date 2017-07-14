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
var helper = require('../services/helper_service');
var userDB = require('../database/function/user');


router.get('/:id', validate({query: require('../schema/users_schema').GetSingle}), function (req, res, next) {

    userDB.getUserByID(req.params['id'], function (err, data) {
        if (err) {
            next(err);
        }
        else {
            res.json(data);
        }
    });

});

router.get('/:id/image', validate({query: require('../schema/users_schema').GetSingle}), function (req, res, next) {

    userDB.getUserByID(req.params['id'], function (err, data) {
        if (err) {
            next(err);
        }
        else {
            if (!data || !Object.keys(data).length) {
                logger.info('No user found for id: ' + req.param['id']);
                res.sendStatus(404);

                return;
            }

            var imgPath = data.imgpath;

            if (imgPath) {
                var path = require('path');
                res.sendFile(path.resolve(imgPath));
            }
            else {
                logger.info('No image found for user');
                res.sendStatus(404);
            }

        }
    });

});
module.exports = router;