/**
 * Created by beuttlerma on 03.07.17.
 */
var logger = require('../global/logger');
var oauthServer = require('oauth2-server');
var config = require('../config/config_loader');

module.exports = function (strategy) {
    var oAuthStrategy;
    try {
        oAuthStrategy = require('./strategy/' + strategy)
    }
    catch (e) {
        logger.info('Unknown oauth provider ' + strategy + ' Loading default strategy');
        oAuthStrategy = require('./strategy/default');
    }

    return new oauthServer({
        model: oAuthStrategy
    })
};