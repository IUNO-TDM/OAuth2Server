/**
 * Created by ElyGomesMa on 07.07.2017.
 */
var logger = require('../../global/logger');
var db = require('../db_connection');

var self = {};


self.getAccessToken = function(token, callback) {
    db.func('getAccessToken', [token])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('GetAccessToken result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.getRefreshToken = function(token, callback) {
    db.func('getRefreshToken', [token])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('getRefreshToken result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.saveToken = function(accessToken, expiresAccToken, refreshToken, expiresRefToken, scopeuuid, clientuuid, useruuid, callback) {
    db.func('saveToken', [accessToken, expiresAccToken, refreshToken, expiresRefToken, scopeuuid, clientuuid, useruuid])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

        logger.debug('saveToken result: ' + JSON.stringify(data));
        callback(null,data);
    })
    .catch(function (error){
        logger.crit(error);
        callback(error);
    });
}
module.exports = self;
