/**
 * Created by beuttlerma on 12.06.17.
 */

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};

var self = {

};


var username = 'postgres';
var password = 're7ahpheibaiweey';
var host = 'test-tdm.fritz.box';
var port = '5432';
var database = 'oauthdb';


self.DB_CONNECTION_STRING = 'postgres://{0}:{1}@{2}:{3}/{4}'.format(username, password, host, port, database);


self.OAUTH_PROVIDER = {
    // facebookAuth: {
    //     'clientID': '1280547921987675', // your App ID
    //     'clientSecret': '0d750ce21896768a2c01db70f9c49795', // your App Secret
    //     'callbackURL': 'http://localhost:8080/auth/facebook/callback',
    //     'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    //     'profileFields': ['id', 'name', 'photos']
    // },
    //
    // twitterAuth: {
    //     'consumerKey': 'IJGbZwQ32bCBktm1f3gVguyEY',
    //     'consumerSecret': '',
    //     'callbackURL': 'http://127.0.0.1:3004/auth/twitter/callback'
    // },
    googleAuth: {
        'clientID': '471839516296-3madk5ilta293oafg3n4ugjc054fkhmh.apps.googleusercontent.com',
        'clientSecret': '',
        'callbackURL': 'http://localhost:3005/passport/google/callback'
    }
};

// CLIENT CREDENTIALS USED ON USER LOGIN
self.OAUTH_CREDENTIALS = {
    CLIENT_ID: 'adb4c297-45bd-437e-ac90-9179eea41744',
    CLIENT_SECRET: 'IsSecret',
    CALLBACK_URL: 'http://localhost:3004/auth/iuno/callback'
};

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
    PROTOCOL: 'https',
    HOST: 'localhost',
    PORT: 3005
};

module.exports = self;