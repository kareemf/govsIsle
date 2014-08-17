'use strict';

var express = require('express'),
    appPath = process.cwd(),
    mongoose = require('mongoose'),
    baseContentModel = require(appPath + '/server/models/baseContentModel');

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

    var _getAssignablePermissionsByFieldPermissions = function(fieldPermissions){
        var assignablePermissions = [];
        var _fieldPermissions = Object.keys(fieldPermissions);
        var pkeys = ['read', 'update']; //TODO: this should come form basePermissionsManager.permissions

        _fieldPermissions.forEach(function(_fieldPermission){
            var fieldPermission = fieldPermissions[_fieldPermission];
            pkeys.forEach(function(key){
                if(fieldPermission[key]){
                    assignablePermissions.push(fieldPermission[key]);
                }
            });
        });

        return assignablePermissions;
    };

    /*makes sure that is Model(s) are updated after the admin role is already created,
    that the admin role will recieve permissions over new fields*/
    function ensureAdminHasAllPermissions(role){
        console.log('ensureAdminHasAllPermissions');
        var rolePermissions = role.permissions;
        var hasNewPermissions = false;

        for(var model in mongoose.models){
            var Model = mongoose.model(model);

            if(Model.fieldPermissions){
                var fieldPermissions = Model.fieldPermissions();
                var documentType = Model.modelName.toLowerCase();
                var neededPermissions = _getAssignablePermissionsByFieldPermissions(fieldPermissions);

                for(var i = rolePermissions.length - 1; i >= 0; i--){
                    var permission = rolePermissions[i];
                    if(permission.documentType !== documentType){
                        continue;
                    }

                    var canDo = permission.canDo;
                    //set diff - remove the list intersections
                    neededPermissions = neededPermissions.filter(function(item){
                        return canDo.indexOf(item) < 0;
                    });
                    //console.log('neededPermissions', neededPermissions)
                }

                if(neededPermissions.length){
                    hasNewPermissions = true;
                    console.log('role', role.name, 'needs new permissions:', neededPermissions);
                    role.permissions.push({
                        documentType: documentType,
                        canDo: neededPermissions
                    });
                }
            }
        };

        if(hasNewPermissions) {
            role.save(function (err) {
                if(err){
                    console.log('error grant admin role new permissions:', err);
                }
                console.log('role', role.name, 'granted new permissions');
            });
        }
    };

    function bootstrapRoles(){
        var Role = mongoose.model('Role');
        var permissionsManager = require('../../controllers/permissionsManager')(null);

        ['admin', 'authenticated'].forEach(function(roleName){
            //create roles iff they doesn't exist
            // TODO: if new model/permission type is added, grant to admin user
            Role.findOne({name: roleName}).exec(function(err, role){
                if(role){
                    console.log('Role exists:', roleName);
                    if(roleName === 'admin'){
                        ensureAdminHasAllPermissions(role);
                    }
                    return;
                }

                role = new Role({name: roleName});

                var permissions = permissionsManager.grantBasicPermissions();

                if(roleName == 'admin'){
                    permissions = permissionsManager.grantAllBasePermissions();

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
