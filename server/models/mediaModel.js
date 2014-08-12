'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: String,
    attribution: String,
    caption: String,
    encoding: String,
    mimetype: String,
    extension: String,
    size: String,
    truncated: Boolean,
    file: Buffer
}, base.properties);

var MediaSchema = new Schema(properties);

var MediaSchema = new Schema(properties, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

MediaSchema.pre('save', function(next) {
    base.preSave(this);
    next();
});

MediaSchema.virtual('permissions')
    .set(function(permissions) {
        this._permissions = permissions;
    })
    .get(function() {
        return this._permissions;
    });

MediaSchema.virtual('url')
    .get(function(){
        // TODO: dont hardcode api url
        return '/api/v1/media/' + this.id;
    });

MediaSchema.statics = base.permissions;

MediaSchema.statics.fieldPermissions = function(){
    return base.fieldPermissions(this);
};

MediaSchema.statics.permissionsGrantedOnCreation = function(){
    return base.permissionsGrantedOnCreation(this);
};

MediaSchema.statics.permissionsGrantedOnUserCreation = function(){
    return base.permissionsGrantedOnUserCreation(this);
};

MediaSchema.statics.permissionsGrantedToAnon = function(){
    var fieldPermissions = this.fieldPermissions();
    var readPermission = this.readPermission();

    //TODO: base permissionsGrantedToAnon which returns slug
    return [
        readPermission,
        fieldPermissions['name'][readPermission],
        fieldPermissions['attribution'][readPermission],
        fieldPermissions['caption'][readPermission],
    ];
};


mongoose.model('Media', MediaSchema);
