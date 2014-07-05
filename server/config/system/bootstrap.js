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
        var permissionsManager = require('../../controllers/permissionsManager')(null);

        ['admin', 'authenticated'].forEach(function(roleName){
            //create roles iff they doesn't exist
            Role.findOne({name: roleName}).exec(function(err, role){
                if(role){
                    console.log('Role exists:', roleName);
                    return;
                }

                role = new Role({name: roleName});

                var permissions = permissionsManager.grantBasicPermissions();

                if(roleName == 'admin'){
                    var allFieldPermissions = permissionsManager.grantAllFieldPermissions();
                    permissions = permissions.concat(allFieldPermissions);
                }

                console.log('granting', roleName, 'permissions', permissions);
                role.permissions = permissions;

                console.log('bootstraping role', roleName);

                role.save(function(err){
                    console.log('role bootstraped:', roleName);
                });
            });
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
