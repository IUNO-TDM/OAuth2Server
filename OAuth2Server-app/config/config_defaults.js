/**
 * Created by beuttlerma on 18.04.17.
 */


var self = {
};



// ---- CONFIGURATION EXPORT ----

self.LOG_LEVEL = 'debug';
self.ALLOWED_CLIENT_IDS = [
    '740467127740-f56vv3l5teo5i9fcoljj0l10klhg7sih.apps.googleusercontent.com',
    '471839516296-3madk5ilta293oafg3n4ugjc054fkhmh.apps.googleusercontent.com'
];

self.OAUTH_ORIGINS = {
    GOOGLE_TOKEN_INFO: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    GOOGLE_USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo'
};

self.DB_CONNECTION_STRING = "postgres://{username}:{password}@{host}:{port}/{database}";

self.USER_ROLES = {
    TD_OWNER: 'TechnologyDataOwner'
};

module.exports = self;