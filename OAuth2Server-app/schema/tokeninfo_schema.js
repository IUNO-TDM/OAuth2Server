/**
 * Created by beuttlerma on 12.06.17.
 */

const self = {};

self.TokenInfo_Query = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            pattern: '^[a-z0-9]{40}$'
        }
    },
    required: ['access_token'],
    additionalProperties: false
};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};


module.exports = self;