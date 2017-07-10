/**
 * Created by ElyGomesMa on 07.07.2017.
 */
var logger = require('../../global/logger');
var db = require('../db_connection');

var self = {};


self.getUser = function(userid, accesstoken, callback) {
    db.func('getUser', [userid, accesstoken])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('GetUser result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.getUserFromClient = function(clientId, callback) {
    db.func('getUserFromClient', [clientId])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('getUserFromClient result: ' + JSON.stringify(data));
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
