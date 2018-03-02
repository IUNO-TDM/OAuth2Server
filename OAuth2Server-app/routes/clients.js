const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const Client = require('../database/model/client');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/clients_schema');

router.get('/:id', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {

    Client.FindSingle(req.params['id'], function (err, client) {
        if (err) {
            next(err);
        }
        else {

            //Check if user is requesting his own information or the information of a foreign user
            if (req.user.client.id !== req.params['id']) {
                return res.json(client.getPublicData());
            }

            return res.json(client.getPrivateData());
        }
    });
});


module.exports = router;