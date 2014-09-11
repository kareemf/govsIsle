'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
    logger = require('mean-logger'),
    appPath = process.cwd();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Initializing system variables
var config = require('./server/config/config');

console.log('connecting to db:', config.db);
var db = mongoose.connect(config.db);

// Bootstrap Models, Dependencies, Routes and the app as an express app
var app = require('./server/config/system/bootstrap')(passport, db);

// Start the app by listening on <port>, optional hostname
var server = app.listen(config.port, config.hostname);
console.log('Mean app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');

function bootstrapSocketRoutes() {
    require('./server/config/util').walk(appPath + '/server/sockets', null, function(path) {
        console.log('require socket router', path);
        require(path)(server);
    });
}

bootstrapSocketRoutes();

// Initializing logger
logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = app;