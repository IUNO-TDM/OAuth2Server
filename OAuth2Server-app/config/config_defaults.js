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
    GOOGLE_USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
    TWITTER_TOKEN_INFO: 'https://api.twitter.com/1.1/account/verify_credentials.json'
};

self.DB_CONNECTION_STRING = "postgres://{username}:{password}@{host}:{port}/{database}";

self.USER_ROLES = {
    TD_OWNER: 'TechnologyDataOwner'
};
self.OAUTH_PROVIDER = {
    facebookAuth: {
        'clientID': '', // your App ID
        'clientSecret': '', // your App Secret
        'callbackURL': 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'name', 'photos']
    },

    twitterAuth: {
        'consumerKey': '',
        'consumerSecret': '',
        'callbackURL': 'http://127.0.0.1:3004/auth/twitter/callback'
    },

    googleAuth: {
        'clientID': '',
        'clientSecret': '',
        'callbackURL': 'http://127.0.0.1:3004/auth/google/callback'
    }
};

module.exports = self;