/***
 This app configuration is for the private / internal api server.
 Only known hosts (core, jms, jmw) should access this API
 ***/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var clientAuthentication = require('./oauth/client_authentication');
var tokenAuthentication = require('./oauth/token_authentication');

var app = express();

// basic setup
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Load all routes

app.use('/oauth', require('./routes/oauth'));
app.use('/tokeninfo', clientAuthentication, require('./routes/tokeninfo'));
app.use('/userinfo', clientAuthentication, require('./routes/userinfo'));
app.use('/users', tokenAuthentication, require('./routes/users'));
app.use('/clients', tokenAuthentication, require('./routes/clients'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler

// Custom validation error
app.use(function (err, req, res, next) {

    var responseData;

    if (err.name === 'JsonSchemaValidation') {
        // Log the error however you please
        console.log(err.message);
        // logs "express-jsonschema: Invalid data found"

        // Set a bad request http response status or whatever you want
        res.status(400);

        // Format the response body however you want
        responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validations  // All of your validation information
        };

        return res.json(responseData);
    }

    if (err.name === 'JsonSchemaValidationError') {
        // Log the error however you please
        console.log(JSON.stringify(err.validationErrors));

        // Set a bad request http response status or whatever you want
        res.status(400);

        // Format the response body however you want
        responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validationErrors  // All of your validation information
        };

        return res.json(responseData);
    }

    next(err);
});


if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
} else {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        // Send error details to the client only when the status is 4XX
        if (err.status && err.status >= 400 && err.status < 500) {
            res.status(err.status);
            res.json({
                message: err.message,
                error: err
            });
        }
        else {
            res.status(500);
            res.send('Something broke!');
        }
    });
}

module.exports = app;
