'use strict';

var _ = require('lodash'),
    slug = require('slug'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId,
    base = require('./baseModel');

exports.properties = _.extend(base.properties, {
    published: {type: Date},
    publishedBy: {type: ObjectId, ref: 'User'},
    slug: String,
    isFeatured: String //ex none, main, event, or tour
});

exports.preSave = function(model){
    //generate a slug for this peice of content
    console.log('base preSave for model', model);

    model.slug = slug(model.name).toLowerCase();
};

exports.permissions = {
    readPermission: function(){
        return 'read';
    },
    readListPermission: function(){
        return 'readList';
    },
    readUnpublishedPermission: function(){
        return 'readUnpublished';
    },
    createPermission: function(){
        return 'create';
    },
    updatePermission: function(){
        return 'update';
    },
    deletePermission: function(){
        return 'delete';
    },
    publishPermission: function(){
        return 'publish';
    }
};

exports.fieldPermissions = function(Schema){
    var permissions = {};

    for (var field in Schema.schema.paths) {
        if (field == '_id' || field == '__v'){
            continue;
        }

        // permissions[field] = 'update-' + field;
        permissions[field] = {
            'read': 'read-' + field,
            'update': 'update-' + field,
        };

        //console.log('creating', Schema.modelName ,'field permissions', permissions[field]);
    };

    return permissions;
};

exports.permissionsGrantedOnCreation = function(Schema, _cantTouch){
    var grant = [Schema.readPermission(), Schema.updatePermission()];
    var fieldPermissions = Schema.fieldPermissions();
    var cantTouch = ['created', 'createdBy', 'deleted', 'deletedBy', 'published'];

    if(_cantTouch){
        cantTouch = cantTouch.concat(_cantTouch);
    }

    for (var field in Schema.schema.paths) {
        if (field == '_id' || field == '__v'){
            continue;
        }
        if(_.contains(cantTouch, field)){
            console.log('cant edit', field, 'without explicit permission');
            continue;
        }
        for(var permission in fieldPermissions[field]){
            grant.push(fieldPermissions[field][permission]);

            // console.log('you can', permission, field);
        }
    };

    //Users can view unpublished versions of docs they create
    grant.push(Schema.readUnpublishedPermission());

    return grant;
};

exports.permissionsGrantedOnUserCreation = function(Schema, _grant){
    var grant = [Schema.readPermission(), Schema.readListPermission()];

    if(_grant){
        grant = grant.concat(_grant);
    }
    return grant;
};
