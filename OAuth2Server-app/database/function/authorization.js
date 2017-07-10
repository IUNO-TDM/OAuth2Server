/**
 * Created by ElyGomesMa on 07.07.2017.
 */
var logger = require('../../global/logger');
var db = require('../db_connection');

var self = {};


self.getAuthorizationCode = function(code, callback) {
    db.func('getAuthorizationCode', [code])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('GetAuthorizationCode result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

module.exports = self;