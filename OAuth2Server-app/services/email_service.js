const dbUser = require('../database/function/user');


const self  = {};

self.sendVerificationMailForUser = function(userUUID) {
    if (!userUUID) {
        return;
    }

    dbUser.CreateRegistrationKey(userUUID, function(err, data) {
        const key = data['registrationkey'];
        //TODO: Send email
        console.log('TODO: Send email');

    });
};

module.exports = self;