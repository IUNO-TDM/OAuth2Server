/**
 * Created by beuttlerma on 18.04.17.
 */


var self = {
};



// ---- CONFIGURATION EXPORT ----

self.LOG_LEVEL = 'debug';
self.USER_UUID = '16f69912-d6be-4ef0-ada8-2c1c75578b51';
self.HOST_SETTINGS = {
    MARKETPLACE_CORE: {
        HOST: 'localhost',
        PORT: 3002
    }
};
self.ALLOWED_CLIENT_IDS = [
    '740467127740-f56vv3l5teo5i9fcoljj0l10klhg7sih.apps.googleusercontent.com'
];

self.OAUTH_ORIGINS = {
    GOOGLE_TOKEN_INFO: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    GOOGLE_USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo'
}

self.DB_CONNECTION_STRING = "";

module.exports = self;