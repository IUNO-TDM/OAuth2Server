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

self.Verify_Body = {
    type: 'object',
    properties: {
        registrationKey: {
            type: 'string',
            format: 'uuid'
        }
    },
    additionalProperties: false
};

module.exports = self;