/**
 * Created by beuttlerma on 18.04.17.
 */


var self = {
};



// ---- CONFIGURATION EXPORT ----

self.LOG_LEVEL = 'debug';

self.ALLOWED_CLIENT_IDS = [
    '740467127740-f56vv3l5teo5i9fcoljj0l10klhg7sih.apps.googleusercontent.com',
    '471839516296-3madk5ilta293oafg3n4ugjc054fkhmh.apps.googleusercontent.com',
    '1555557494507604'
];

self.OAUTH_ORIGINS = {
    GOOGLE_TOKEN_INFO: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    GOOGLE_USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
    TWITTER_PROFILE_INFO: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    FACEBOOK_TOKEN_INFO: 'https://graph.facebook.com/debug_token',
    FACEBOOK_TOKEN_ENDPOINT: 'https://graph.facebook.com/oauth/access_token'
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
        'profileFields': ['id', 'name', 'photos', 'email'],
        'passReqToCallback': true
    },

    twitterAuth: {
        'consumerKey': '',
        'consumerSecret': '',
        'callbackURL': 'http://127.0.0.1:3004/auth/twitter/callback',
        'passReqToCallback': true,
        'includeEmail': true
    },

    googleAuth: {
        'clientID': '',
        'clientSecret': '',
        'callbackURL': 'http://127.0.0.1:3004/auth/google/callback',
        'passReqToCallback': true
    }
};


// CLIENT CREDENTIALS USED ON USER LOGIN
self.OAUTH_CREDENTIALS = {
    CLIENT_ID: '',
    CLIENT_SECRET: ''
};

self.SESSION_SECRET = 'lbfifiou23bgofr2g18fbo2lbfl2hbfdskb2o78gf324ougf232vksjhdvfakfviy3263972i';

self.G_RE_CAPTCHA_SECRET = '';

self.SMTP_CONFIG = {
    email: 'a@b.c',
    host: 'smtp.1und1.de',
    port: 587,
    secure: true,
    auth: {
        user: 'username',
        pass: 'password'
    }
};

self.HOST_SETTINGS = {
    PROTOCOL: 'http',
    HOST: 'localhost',
    PORT: 3005
};

module.exports = self;