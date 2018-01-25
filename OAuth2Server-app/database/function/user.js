/**
 * Created by ElyGomesMa on 07.07.2017.
 */
var logger = require('../../global/logger');
var db = require('../db_connection');

var self = {};


self.getUser = function (userEmail, password, callback) {
    db.func('getUser', [userEmail, password])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('GetUser result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.getUserByExternalID = function (userid, oAuthProvider, callback) {
    db.func('getUserByExternalID', [userid, oAuthProvider])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('getUserByExternalID result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.getUserFromClient = function (clientId, callback) {
    db.func('getUserFromClient', [clientId])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('getUserFromClient result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.getUserByID = function (userid, callback) {
    db.func('getUserByID', [userid])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('GetUserByID result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};


self.SetUser = function (externalid, username, firstname, lastname, useremail, oauth2provider, imgpath, thumbnail, roles, pwd, callback) {
    db.func('SetUser', [externalid, username, firstname, lastname, useremail, oauth2provider, imgpath, thumbnail, roles, pwd])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('SetUser result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.CreateRegistrationKey = function (userUUID, callback) {
    db.func('CreateRegistrationKey', [userUUID])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('CreateRegistrationKey result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

self.VerifyUser = function (userUUID, registrationKey, callback) {
    db.func('VerifyUser', [userUUID, registrationKey])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('VerifyUser result: ' + JSON.stringify(data));

            callback(null, data ? data['verifyuser'] : false);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};


self.CreatePasswordKey = function (userEmail, callback) {
    db.func('CreatePasswordKey', [userEmail])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('CreatePasswordKey result: ' + JSON.stringify(data));
            callback(null, data);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};


self.ResetPassword = function (userEmail, passwordKey, password, callback) {
    db.func('ResetPassword', [userEmail, passwordKey, password])
        .then(function (data) {
            if (data && data.length) {
                data = data[0];
            }
            else {
                data = null;
            }

            logger.debug('ResetPassword result: ' + JSON.stringify(data));

            callback(null, data ? data['resetpassword'] : false);
        })
        .catch(function (error) {
            logger.crit(error);
            callback(error);
        });
};

module.exports = self;
