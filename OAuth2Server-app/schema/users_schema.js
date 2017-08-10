/* ##########################################################################
 -- Author: Marcel Ely Gomes
 -- Company: Trumpf Werkzeugmaschine GmbH & Co KG
 -- CreatedAt: 2017-03-02
 -- Description: Schema for Users
 -- ##########################################################################*/

var self ={};

self.GetSingle = {
    type: 'object',
    properties: {
    }
};
self.Create = {
    type: 'object',
    properties: {
        first_name: {
            type: 'string',
            required: true
        },
        last_name: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        }
    }
};
module.exports = self;