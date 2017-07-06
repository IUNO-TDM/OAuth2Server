/**
 * Created by beuttlerma on 12.06.17.
 */

var self = {};

self.requestBody = {
    type: 'object',
    properties: {
        grant_type: {
            type: 'string',
            required: true
        },
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        },
        oauth_provider: {
            type: 'string',
            required: true
        }
    }
};


module.exports = self;