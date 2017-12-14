/**
 * Created by beuttlerma on 12.06.17.
 */

const self = {};

self.Logout_Query = {
    type: 'object',
    properties: {
        redirect: {
            type: 'string',
            format: 'uri'
        }
    },
    additionalProperties: false
};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.Passport_Query = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.GoogleCallback_Query = {
    type: 'object',
    properties: {
        code: {
            type: 'string',
            minLength: 20,
            maxLength: 1000
        }
    },
    required: ['code'],
    additionalProperties: false
};

self.TwitterCallback_Query = {
    type: 'object',
    properties: {
        oauth_token: {
            type: 'string',
            minLength: 20,
            maxLength: 1000
        },
        oauth_verifier: {
            type: 'string',
            minLength: 20,
            maxLength: 1000
        }
    },
    required: ['oauth_token', 'oauth_verifier'],
    additionalProperties: false
};

self.FacebookCallback_Query = {
    type: 'object',
    properties: {
        code: {
            type: 'string',
            minLength: 20,
            maxLength: 1000
        }
    },
    required: ['code'],
    additionalProperties: false
};

self.PassportLogin_Query = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.PassportLogin_Body = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: 8,
            maxLength: 250
        }
    },
    required: ['email', 'password'],
    additionalProperties: false
};

self.PassportSignup_Query = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.PassportSignup_Body = {
    type: 'object',
    properties: {
        first_name: {
            type: 'string',
            minLength: 1,
            maxLength: 250
        },
        last_name: {
            type: 'string',
            minLength: 1,
            maxLength: 250
        },
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: 8,
            maxLength: 250
        },
        confirm_password: {
            type: 'string',
            minLength: 1,
            maxLength: 250
        }
    },
    required: ['first_name', 'last_name', 'email', 'password'],
    additionalProperties: false
};


module.exports = self;