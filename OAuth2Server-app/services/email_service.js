const dbUser = require('../database/function/user');
const logger = require('../global/logger');
const nodemailer = require('nodemailer');
const CONFIG = require('../config/config_loader');
const fs = require('fs');
const path = require('path');

const self = {};

self.sendResetPasswordMail = function (email) {
    if (!email) {
        return;
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'docker') {
        logger.info('[email_service] Development Environment - Reset password mails are disabled during development');

        return;
    }

    dbUser.CreatePasswordKey(email, function(err, data) {
        if (err) {
            logger.crit('[email_service] Could not send reset email');

            return;
        }

        const key = data['passwordkey'];

        var transporter = nodemailer.createTransport(CONFIG.SMTP_CONFIG);

        const template = 'assets/mail_templates/reset_password.html';
        const resetPasswordUrl = '{0}://{1}:{2}/reset-password?email={3}&key={4}'.format(
            CONFIG.HOST_SETTINGS.PROTOCOL,
            CONFIG.HOST_SETTINGS.HOST,
            CONFIG.HOST_SETTINGS.PORT,
            email,
            key
        );
        const placeHolders = {
            '\\${RESET_PASSWORD_URL}': resetPasswordUrl
        };

        loadHTMLTemplate(template, placeHolders, function (err, template) {
            if (err) {
                logger.warn('[email_service] could not load html template for password reset.');
                return;
            }

            var mailOptions = {
                from: CONFIG.SMTP_CONFIG.email,
                to: email,
                subject: 'IUNO - Technologiedatenmarktplatz: E-Mail Passwort zurücksetzen',
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


        const template = 'assets/mail_templates/email_verification.html';
        const verificationUrl = '{0}://{1}:{2}/passport/verify?user={3}&key={4}'.format(
            CONFIG.HOST_SETTINGS.PROTOCOL,
            CONFIG.HOST_SETTINGS.HOST,
            CONFIG.HOST_SETTINGS.PORT,
            user.id,
            key
        );
        const placeHolders = {
            '\\${VERIFICATION_URL}': verificationUrl
        };

        loadHTMLTemplate(template, placeHolders, function (err, template) {
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

function loadHTMLTemplate(templateName, placeholders, callback) {

    fs.readFile(path.resolve(templateName), "utf8", function (err, data) {
        if (err) {
            logger.crit(err);
            return callback(err);
        }

        for (var key in placeholders) {
            data = data.replace(new RegExp(key, 'g'), placeholders[key]);
        }

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
