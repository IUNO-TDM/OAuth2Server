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
    oneOf: [
        {
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
        },
        {
            type: 'object',
            properties: {
                denied: {
                    type: 'string',
                    minLength: 20,
                    maxLength: 40
                }
            },
            required: ['denied'],
            additionalProperties: false
        }]
};

self.FacebookCallback_Query = {
    oneOf: [
        {
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
        },
        {
            type: 'object',
            properties: {
                error: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 20
                },
                error_code: {
                    type: 'integer',
                    maximum: 1000
                },
                error_description: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 1000
                },
                error_reason: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 1000
                }
            },
            required: ['error', 'error_code', 'error_description', 'error_reason'],
            additionalProperties: false
        }]

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
        },
        'g-recaptcha-response': {
            type: 'string',
            pattern: '[A-Za-z0-9_-]+'
        }
    },
    required: ['first_name', 'last_name', 'email', 'password', 'g-recaptcha-response'],
    additionalProperties: false
};

self.Verify_Query = {
    type: 'object',
    properties: {
        user: {
          type: 'string',
          format: 'uuid'
        },
        key: {
            type: 'string',
            format: 'uuid'
        }
    },
    additionalProperties: false
};

self.Resend_Email_Body = {
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
        },
        'g-recaptcha-response': {
            type: 'string',
            pattern: '[A-Za-z0-9_-]+'
        }
    },
    required: ['email', 'password', 'g-recaptcha-response'],
    additionalProperties: false
};


module.exports = self;