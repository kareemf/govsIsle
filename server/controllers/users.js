'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role');

var grantBasicPermissions = function(){
    var permissions = [];
    for(var model in mongoose.models){
        var Model = mongoose.model(model);

        //If a Model specifies permissions to grant to all users, assign them now
        if(Model.permissionsGrantedOnUserCreation){
            var _permissions = Model.permissionsGrantedOnUserCreation();

            permissions.push({
                documentType: Model.modelName.toLowerCase(),
                canDo: _permissions
            });

            // console.log(Model.collection.name, 'permissionsGrantedOnUserCreation:', _permissions);
            // console.log('permissions', permissions);
        }
    };
    return permissions;
    // console.log('permissionsGrantedOnUserCreation:', permissions);
};

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);

    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1,20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    User.count(function(err, count){
        var roleQueryParams = {name: 'authenticated'};

        if(!count){
            //If this is the frist user, give admin role
            roleQueryParams = {name: 'admin'};
        }
        console.log('searching for role:', roleQueryParams);

        Role.findOne(roleQueryParams).exec(function(err, role){
            console.log('giving user role:', role);

            if(role){
                user.roles = [role];
            }

            user.permissions = grantBasicPermissions();

            user.save(function(err) {
                console.log('user saved');
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            res.status(400).send('Username already taken');
                            break;
                        default:
                            res.status(400).send('Please fill all the required fields');
                    }

                    return res.status(400);
                }
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    return res.redirect('/');
                });
                res.status(200);
            });

        });
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};
