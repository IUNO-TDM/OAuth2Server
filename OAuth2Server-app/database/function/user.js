/**
 * Created by ElyGomesMa on 07.07.2017.
 */
var logger = require('../../global/logger');
var db = require('../db_connection');

var self = {};


self.getUser = function(userid, password, callback) {
    db.func('getUser', [userid, password])
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

self.getUserByExternalID = function(userid, callback) {
    db.func('getUserByExternalID', [userid])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('getUserByExternalID result: ' + JSON.stringify(data));
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

self.getUserByID = function(userid, callback) {
    db.func('getUserByID', [userid])
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

self.createUser = function(externalid, username, firstname, lastname, useremail, oauth2provider, imgpath, thumbnail, callback) {
    db.func('createUser', [externalid, username, firstname, lastname, useremail, oauth2provider, imgpath, thumbnail])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }

            logger.debug('createUser result: ' + JSON.stringify(data));
            callback(null,data);
        })
        .catch(function (error){
            logger.crit(error);
            callback(error);
        });
}
module.exports = self;
