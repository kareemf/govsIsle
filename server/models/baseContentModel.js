'use strict';

var _ = require('lodash'),
    slug = require('slug'),
    base = require('./baseModel');

exports.properties = _.extend(base.properties, {
    published: {type: Date},
    slug: String
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

