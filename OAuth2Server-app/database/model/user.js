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
 * @param id
 * @param username
 * @param externalid
 * @param firstname
 * @param lastname
 * @param useremail
 * @param oauth2provider
 * @param imgpath
 * @param createdat
 * @param updatedat
 * @param userRoles
 *
 * @constructor
 */
function User(id, username, externalid, firstname, lastname, useremail, oauth2provider, imgpath, createdat, updatedat, password, userRoles) {
    this.id = id;
    this.username = username;
    this.externalid = externalid;
    this.firstname = firstname;
    this.lastname = lastname;
    this.useremail = useremail;
    this.oauth2provider = oauth2provider;
    this.imgpath = imgpath;
    this.createdat = createdat;
    this.updatedat = updatedat;
    this.password = password;
    this.userRoles = userRoles;
}

User.prototype.SetProperties = function (data) {
    if (data) {
        this.id = data.id ? data.id : this.id;
        this.username = data.username ? data.username : this.username;
        this.externalid = data.externalid ? data.externalid : this.externalid;
        this.firstname = data.firstname ? data.firstname : this.firstname;
        this.lastname = data.lastname ? data.lastname : this.lastname;
        this.useremail = data.useremail ? data.useremail : this.useremail;
        this.oauth2provider = data.oauth2provider ? data.oauth2provider : this.oauth2provider;
        this.imgpath = data.imgpath ? data.imgpath : this.imgpath;
        this.createdat = data.createdat ? data.createdat : this.createdat;
        this.updatedat = data.updatedat ? data.updatedat : this.updatedat;
        this.userRoles = data.userRoles ? data.userRoles : this.userRoles;
    }
};

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
        callback(err, new User().SetProperties(userData));
    })
};

User.prototype.Create = function (callback) {
    const self = this;
    dbUser.SetUser(this.externalid, this.username, this.firstname, this.lastname,
        this.useremail, this.oauth2provider, this.imgpath, null, this.userRoles, this.password, function (err, userData) {
            if (err) {
                logger.warn(err);
            }

            if (userData) {
                self.SetProperties(userData);
                return callback(err, self);
            }

            callback(err, null);
        });
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