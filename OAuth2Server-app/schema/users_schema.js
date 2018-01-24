/* ##########################################################################
 -- Author: Marcel Ely Gomes
 -- Company: Trumpf Werkzeugmaschine GmbH & Co KG
 -- CreatedAt: 2017-03-02
 -- Description: Schema for Users
 -- ##########################################################################*/

const self ={};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.Verify_Query = {
    type: 'object',
    properties: {
        registrationKey: {
            type: 'string',
            format: 'uuid'
        }
    },
    additionalProperties: false
};

self.Resend_Email_Body = {
    type: 'object',
    properties: {
        'g-recaptcha-response': {
            type: 'string',
            pattern: '[A-Za-z0-9_-]+'
        }
    },
    required: ['g-recaptcha-response'],
    additionalProperties: false
};

module.exports = self;