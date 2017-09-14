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
    try {
        if (!url) {
            return callback(new Error('Empty url string'));
        }
        request.head(url, function (err, res, body) {
            if (err) {
                return callback(err);
            }

            var relPath = 'images/' + uuid.v1().replace('-', '') + '.' + mime.extension(res.headers['content-type']);

            downloadImageToPath(url, relPath, callback);
        });
    }
    catch (err) {
        callback(err);
    }


};

self.updateUserImage = function(imageUrl, localImagePath) {
    if (localImagePath && fs.existsSync(path.resolve(localImagePath))) {
        logger.debug('[download_service] User image up-to-date');
        //TODO: Compare images
        return;
    }

    if (!imageUrl) {
        logger.warn('[download_service] Missing profile image url');
        return;
    }

    logger.info('User image is not up-do-date. Downloading it again');
    downloadImageToPath(imageUrl, localImagePath)
};

function downloadImageToPath(url, relPath, callback) {
    var absPath = path.resolve(relPath);

    //TODO: Maybe set a maximum file size

    request(url).pipe(fs.createWriteStream(absPath)).on('close', function (err) {

        if (err) {
            logger.crit(err);
        }

        if (callback) {
            callback(err, relPath)
        }
    });
}

module.exports = self;