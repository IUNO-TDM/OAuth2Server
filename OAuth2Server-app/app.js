const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const tokenAuthentication = require('./oauth/token_authentication');
const passport = require('passport');
const session = require('cookie-session');
const config = require('./config/config_loader');

var app = express();

// Accept JSON only
app.use('/', function (req, res, next) {
    if (!(req.is('application/json') || req.is('application/x-www-form-urlencoded'))) {
        return res.status(400).send('content-type not accepted');
    }

    next();
});

// basic setup
app.use(logger('dev'));

//Configure Passport
require('./passport/passport')(passport); // pass passport for configuration

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// Load all routes

app.use('/passport', require('./routes/passport')(passport));
app.use('/oauth', require('./routes/oauth'));
app.use('/users', tokenAuthentication, require('./routes/users'));
app.use('/', function (req, res, next) {
    res.redirect('/login.html')
});

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

        res.json(responseData);
    } else {
        // pass error to next error middleware handler
        next(err);
    }
});

if (app.get('env') !== 'development') {
    app.use(function(err, req, res, next) {
        //Always logout user on failure
        req.logout();
        next(err, req, res)
    });
}

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
