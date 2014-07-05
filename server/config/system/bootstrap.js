'use strict';

var express = require('express'),
    appPath = process.cwd();

var mean = require('meanio');
mean.app('Mean Demo App', {});

module.exports = function(passport, db) {

    function bootstrapModels() {
        // Bootstrap models
        require('../util').walk(appPath + '/server/models', null, function(path) {
            console.log('require model', path);
            require(path);
        });
    }

    bootstrapModels();

    function bootstrapRoles(){
        var mongoose = require('mongoose');
        var Role = mongoose.model('Role');

        //create roles iff they doesn't exist
        Role.findOne({name: 'admin'}).exec(function(err, adminRole){
            if(adminRole){
                console.log('admin Role exists');
                return;
            }
            adminRole = new Role({
                name: 'admin',
                permissions: [] //TODO
            });

            console.log('bootstrapRoles admin')
        });

        Role.findOne({name: 'authenticated'}).exec(function(err, authenticatedRole){
            if(authenticatedRole){
                console.log('authenticated Role exists');
                return;
            }
            authenticatedRole = new Role({
                name: 'authenticated',
                permissions: [] //TODO
            });

            console.log('bootstrapRoles authenticated')

        });
    };

    bootstrapRoles();

    // Bootstrap passport config
    require(appPath + '/server/config/passport')(passport);

    function bootstrapDependencies() {
        // Register passport dependency
        mean.register('passport', function() {
            return passport;
        });

        // Register auth dependency
        mean.register('auth', function() {
            return require(appPath + '/server/routes/middlewares/authorization');
        });

        // Register database dependency
        mean.register('database', {
            connection: db
        });

        // Register app dependency
        mean.register('app', function() {
            return app;
        });
    }

    bootstrapDependencies();

    // Express settings
    var app = express();
    require(appPath + '/server/config/express')(app, passport, db);

    return app;
};
