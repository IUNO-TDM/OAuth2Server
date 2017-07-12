/**
 * Created by beuttlerma on 12.06.17.
 */

var self = {};

self.query = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            required: true
        }
    }
};


module.exports = self;