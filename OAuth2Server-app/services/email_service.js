const dbUser = require('../database/function/user');
const logger = require('../global/logger');
const nodemailer = require('nodemailer');
const CONFIG = require('../config/config_loader');
const fs = require('fs');
const path = require('path');

const self = {};

self.sendResetPasswordMail = function (email, language) {
    if (!email) {
        return;
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'docker') {
        logger.info('[email_service] Development Environment - Reset password mails are disabled during development');

        return;
    }

    dbUser.CreatePasswordKey(email, function (err, data) {
        if (err) {
            logger.crit('[email_service] Could not send reset email');

            return;
        }

        const key = data['passwordkey'];

        var transporter = nodemailer.createTransport(CONFIG.SMTP_CONFIG);

        const PROTOCOL = CONFIG.HOST_SETTINGS.PROTOCOL ? CONFIG.HOST_SETTINGS.PROTOCOL : 'https';
        const HOST = CONFIG.HOST_SETTINGS.HOST ? CONFIG.HOST_SETTINGS.HOST : 'tdm-jmw.axoom.cloud';
        const PORT = CONFIG.HOST_SETTINGS.PORT ? ':' + CONFIG.HOST_SETTINGS.PORT : '';

        const template = 'assets/mail_templates/reset_password_'+language+'.html';
        const resetPasswordUrl = ('{0}://{1}{2}/'+language+'/reset-password?email={3}&key={4}').format(
            PROTOCOL,
            HOST,
            PORT,
            email,
            key
        );
        const placeHolders = {
            '\\${RESET_PASSWORD_URL}': resetPasswordUrl
        };

        loadHTMLTemplate(template, placeHolders, function (err, template, subject) {
            if (err) {
                logger.warn('[email_service] could not load html template for password reset.');
                return;
            }

            var mailOptions = {
                from: CONFIG.SMTP_CONFIG.email,
                to: email,
                subject: subject,
                html: template
            };

            console.log(template)

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

self.sendVerificationMailForUser = function (user, language) {
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


        const template = 'assets/mail_templates/email_verification_'+language+'.html';

        const PROTOCOL = CONFIG.HOST_SETTINGS.PROTOCOL ? CONFIG.HOST_SETTINGS.PROTOCOL : 'https';
        const HOST = CONFIG.HOST_SETTINGS.HOST ? CONFIG.HOST_SETTINGS.HOST : 'tdm-jmw.axoom.cloud';
        const PORT = CONFIG.HOST_SETTINGS.PORT ? ':' + CONFIG.HOST_SETTINGS.PORT : '';


        const verificationUrl = ('{0}://{1}{2}/passport/verify?user={3}&key={4}&language={5}').format(
            PROTOCOL,
            HOST,
            PORT,
            user.id,
            key,
            language
        );
        const placeHolders = {
            '\\${VERIFICATION_URL}': verificationUrl
        };

        loadHTMLTemplate(template, placeHolders, function (err, template, subject) {
            if (err) {
                logger.warn('[email_service] could not load html template for email verification.');
                return;
            }

            var mailOptions = {
                from: CONFIG.SMTP_CONFIG.email,
                to: user.useremail,
                subject: subject,
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

function loadHTMLTemplate(templateName, placeholders, callback) {

    fs.readFile(path.resolve(templateName), "utf8", function (err, data) {
        if (err) {
            logger.crit(err);
            return callback(err);
        }

        var subject = "IUNO Technology Data Marketplace"
        var metadataSubject = data.match(new RegExp("<meta name=\"e-mail-subject\" content=\"(.*)\">", "i"))
        if (metadataSubject) {
            subject = metadataSubject[1]
        }
        for (var key in placeholders) {
            data = data.replace(new RegExp(key, 'g'), placeholders[key]);
        }

        callback(null, data, subject);
    });
}

String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a) {
        return args[+(a.substr(1, a.length - 2)) || 0];
    });
};

module.exports = self;
