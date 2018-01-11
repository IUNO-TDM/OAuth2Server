const request = require('request');
const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const self = {};

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true
    }
}

self.verifyReCaptchaResponse = function (res, callback) {
    var options = buildOptionsForRequest(
        'POST',
        'HTTPS',
        'www.google.com',
        '443',
        '/recaptcha/api/siteverify',
        {
            response: res,
            secret: CONFIG.G_RE_CAPTCHA_SECRET
        });

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'docker') {
        logger.info('[recaptcha_adapter] ignoring captcha result on development env');
        callback(null, true);
        return;
    }


    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        return callback(err || e, jsonData.success);
    });
};

module.exports = self;
