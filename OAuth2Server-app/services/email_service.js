const dbUser = require('../database/function/user');
const logger = require('../global/logger');
const nodemailer = require('nodemailer');
const CONFIG = require('../config/config_loader');
const fs = require('fs');
const path = require('path');

const self = {};

self.sendVerificationMailForUser = function (user) {
    if (!user) {
        return;
    }

    dbUser.CreateRegistrationKey(user.id, function (err, data) {
        if (err) {
            logger.crit('[email_service] Could not send registration email');

            return;
        }
        const key = data['registrationkey'];

        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'docker') {
            logger.info('[email_service] Development Environment - E-Mail Verification is disabled during development');

            dbUser.VerifyUser(user.id, key, function (err, success) {
            });

            return;
        }

        var transporter = nodemailer.createTransport(CONFIG.SMTP_CONFIG);

        loadHTMLTemplate(user.id, key, function (err, template) {
            if (err) {
                logger.warn('[email_service] could not load html template for email verification.');
                return;
            }

            var mailOptions = {
                from: CONFIG.SMTP_CONFIG.email,
                to: user.useremail,
                subject: 'IUNO - Technologiedatenmarktplatz: E-Mail Adresse bestätigen',
                html: template
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    logger.warn(error);
                } else {
                    logger.info('[email_service]Email sent: ' + info.response);
                }
            });
        });
    });
};

function loadHTMLTemplate(user, key, callback) {

    fs.readFile(path.resolve("assets/mail_templates/email_verification.html"), "utf8", function (err, data) {
        if (err) {
            logger.crit(err);
            return callback(err);
        }

        const verificationUrl = '{0}://{1}{2}/passport/verify?user={3}&key={4}'.format(
            CONFIG.HOST_SETTINGS.PROTOCOL,
            CONFIG.HOST_SETTINGS.HOST,
            CONFIG.HOST_SETTINGS.PORT,
            user,
            key
        );

        data = data.replace(new RegExp('\\${VERIFICATION_URL}', 'g'), verificationUrl);

        callback(null, data);
    });
}

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};

module.exports = self;
