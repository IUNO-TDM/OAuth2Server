/**
 * Created by beuttlerma on 12.06.17.
 */

const self = {};

self.Token_Body = {
    type: 'object',
    properties: {
        grant_type: {
            type: 'string',
            enum: ['password', 'refresh_token', 'client_credentials', 'authorization_code']
        },
        code: {
            type: 'string',
            pattern: '^[a-z0-9]{40}$'
        },
        redirect_uri: {
            type: 'string',
            format: 'uri'
        },
        refresh_token: {
            type: 'string',
            pattern: '^[a-z0-9]{40}$'
        },
        username: {
            type: 'string',
            format: 'email',
            minLength: 1,
            maxLength: 250
        },
        password: {
            type: 'string',
            minLength: 1,
            maxLength: 250
        },
        client_id: {
            type: 'string',
            format: 'uuid'
        },
        client_secret: {
            type: 'string',
            minLength: 1,
            maxLength: 250
        }
    },
    required: ['grant_type'],
    additionalProperties: true
};

self.Authorise_Query = {
    type: 'object',
    properties: {
        response_type: {
            type: 'string',
            enum: ['code']
        },
        client_id: {
            type: 'string',
            format: 'uuid'
        },
        redirect_uri: {
            type: 'string',
            format: 'uri'
        }
    },
    required: ['response_type', 'client_id', 'redirect_uri'],
    additionalProperties: false
};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};


module.exports = self;