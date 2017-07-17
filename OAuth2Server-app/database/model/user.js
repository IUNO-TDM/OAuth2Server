/**
 * Created by beuttlerma on 14.03.17.
 */

var logger = require('../../global/logger');
var dbUser = require('../function/user');
var _ = require('lodash');

/**
 * Builds a user object from a database response
 *
 * @class User
 * @type {Object}
 *
 * @param data
 * @constructor
 */
function User(data) {
    if (data) {
        this.id = data.id;
        this.username = data.username;
        this.externalid = data.externalid;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.useremail = data.useremail;
        this.oauth2provider = data.oauth2provider;
        this.imgpath = data.imgpath;
        this.createdat = data.createdat;
        this.updatedat = data.updatedat;
    }
}

User.prototype.FindAll = User.FindAll = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};

/**
 *
 * @type {User.FindSingle}
 * @return User
 */
User.prototype.FindSingle = User.FindSingle = function (id, callback) {
    dbUser.getUserByID(id, function (err, userData) {
        callback(err, new User(userData));
    })
};

User.prototype.Create = function (callback) {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};
User.prototype.Update = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};
User.prototype.Delete = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};

User.prototype.getPrivateData = function () {
    return _.pick(this, [
        'id', 'username', 'externalid', 'firstname', 'lastname', 'useremail', 'oauth2provider'
    ]);
};

User.prototype.getPublicData = function () {
    return _.pick(this, [
        'id', 'username'
    ]);
};


module.exports = User;