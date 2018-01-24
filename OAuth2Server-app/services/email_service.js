const dbUser = require('../database/function/user');
const logger = require('../global/logger');

const self  = {};

self.sendVerificationMailForUser = function(userUUID) {
    if (!userUUID) {
        return;
    }

    dbUser.CreateRegistrationKey(userUUID, function(err, data) {
        if (err) {
            logger.crit('[email_service] Could not send registration email');

            return;
        }
        const key = data['registrationkey'];
        //TODO: Send email
        console.log('TODO: Send email');

    });
};

module.exports = self;