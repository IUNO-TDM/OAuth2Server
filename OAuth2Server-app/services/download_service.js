/**
 * Created by beuttlerma on 14.07.17.
 */

var fs = require('fs'),
    request = require('request'),
    logger = require('../global/logger'),
    path = require('path'),
    uuid = require('uuid'),
    mime = require('mime-types');


var self = {};

self.downloadImageFromUrl = function (url, callback) {
    if (!url) {
        return callback(new Error('Empty url string'));
    }
    request.head(url, function (err, res, body) {
        if (err) {
            return callback(err);
        }

        var relPath = 'images/' + uuid.v1().replace('-', '') + '.' + mime.extension(res.headers['content-type']);
        var absPath = path.resolve(relPath);

        //TODO: Maybe set a maximum file size

        request(url).pipe(fs.createWriteStream(absPath)).on('close', function (err) {
            logger.crit(err);
            callback(err, relPath)
        });
    });
};

module.exports = self;