const express = require('express');
const path = require('path').posix;
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const queryParser = require('express-query-int');
const tokenAuthentication = require('./oauth/token_authentication');
const contentTypeValidation = require('./services/content_type_validation');
const passport = require('passport');
const session = require('cookie-session');
const config = require('./config/config_loader');


const app = express();

app.use('/', contentTypeValidation);

// basic setup
app.use(logger('dev'));

//Configure Passport
require('./passport/passport')(passport); // pass passport for configuration

app.use(bodyParser.json());
app.use(queryParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(session({
    secret: config.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// Load all routes

app.use('/passport', require('./routes/passport')(passport));
app.use('/oauth', require('./routes/oauth'));

// ---------------------------------------------------------------------------
//   Angular Routing
// ---------------------------------------------------------------------------

// This route automatically reads all available paths in the dist folder
// and serves things like /de/polyfills.856a55e4e31639c9ec48.bundle.js
app.use(express.static(path.join(__dirname, 'dist')));

// This route handles all requests to /de which are not served by the '/' rule.
// These are especially routes which are angular internal routings.
app.use('/de', function(req, res) {
    res.sendFile(path.join(__dirname, 'dist/de/index.html'));
})

// This route handles all requests to /en which are not served by the '/' rule.
// These are especially routes which are angular internal routings.
app.use('/en', function(req, res) {
    res.sendFile(path.join(__dirname, 'dist/en/index.html'));
})

// This route selects the preferred language of the browser
// and redirects the client. If the preferred language is not
// supported, the browser is redirected to 'en'.
app.use('/', function(req, res, next) {
    var preferredLanguage = req.acceptsLanguages('de', 'en')
    if (!preferredLanguage) {
        preferredLanguage = 'en'
    }
    var targetPath = path.join('/', preferredLanguage, req.path)
    res.redirect(targetPath)
})

// app.use('*', function (req, res, next) {
//     res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

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
