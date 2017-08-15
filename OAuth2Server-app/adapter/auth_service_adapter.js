/**
 * Created by beuttlerma on 02.06.17.
 */


var logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
var request = require('request');

var self = {};

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Authorization': 'Basic ' + new Buffer(CONFIG.OAUTH_CREDENTIALS.CLIENT_ID + ':' + CONFIG.OAUTH_CREDENTIALS.CLIENT_SECRET).toString('base64')
        }
    }
}


self.login = function (strategy, username, password, callback) {
    if (typeof(callback) !== 'function') {
        callback = function (err, data) {
            logger.warn('Callback not handled by caller');
        };
    }

    var options = buildOptionsForRequest(
        'POST',
        'http',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/oauth/token',
        {}
    );


    options.form = {
        grant_type: 'password',
        username: username,
        password: password,
        oauth_provider: strategy
    };

    request(options, function (e, r, jsonData) {
        logger.debug('Response from OAUTH Server: ' + JSON.stringify(jsonData));
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        callback(err, jsonData);
    });

};

module.exports = self;