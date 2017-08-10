const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const validate = require('express-jsonschema').validate;
const User = require('../database/model/user');
const CONFIG = require('../config/config_loader');
const helper = require('../services/helper_service');

router.post('/', validate({body: require('../schema/users_schema').Create}), function (req, res, next) {

    const user = new User(
        null,
        req.body.email,
        null,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        'iuno',
        null,
        null,
        null,
        req.body.password,
        [CONFIG.USER_ROLES.TD_OWNER]
    );

    user.Create(function(err) {
        if (err) {
            return next(err);
        }

        const fullUrl = helper.buildFullUrlFromRequest(req);
        res.set('Location', fullUrl + user.id);
        res.sendStatus(201);
    })
});

module.exports = router;