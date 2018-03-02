/**
 * Created by beuttlerma on 14.03.17.
 */

const logger = require('../../global/logger');
const dbClient = require('../function/client');
const _ = require('lodash');


function Client(id, clientname, redirectUris, grants, scope) {
    this.id = id;
    this.clientname = clientname;
    this.redirectUris = redirectUris;
    this.grants = grants;
    this.scope = scope;
}

Client.prototype.SetProperties = function (data) {
    if (data) {
        this.id = data.id ? data.id : this.id;
        this.clientname = data.clientname ? data.clientname : this.clientname;
        this.redirectUris = data.redirectUris ? data.redirectUris : this.redirectUris;
        this.grants = data.grants ? data.grants: this.grants;
        this.scope = data.scope ? data.scope : this.scope;
    }
};

Client.prototype.FindAll = Client.FindAll = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};

/**
 *
 * @type {Client.FindSingle}
 * @return Client
 */
Client.prototype.FindSingle = Client.FindSingle = function (id, callback) {
    dbClient.getClientById(id, function (err, clientData) {
        const client = new Client();
        client.SetProperties(clientData);
        callback(err, client);
    })
};

Client.prototype.Create = function (callback) {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};
Client.prototype.Update = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};
Client.prototype.Delete = function () {
    throw {name: "NotImplementedError", message: "Function not implemented yet"}; //TODO: Implement this function if needed
};

Client.prototype.getPrivateData = function () {
    return _.pick(this, [
        'id', 'clientname', 'redirectUris', 'grants', 'scope'
    ]);
};

Client.prototype.getPublicData = function () {
    return _.pick(this, [
        'id', 'clientname'
    ]);
};


module.exports = Client;