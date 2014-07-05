'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: String,
    type: String, // Activity, Exhibit, Tour, Program/Festival
    description: String,
    visibility: String, //Private/Public
    setupDateTime: Date,
    startDateTime: Date,
    endDateTime: Date,
    cleanupDateTime: Date,
    isReccuring: Boolean,
    anticipatedAttendance: Number,
    location: String,
    geoLocation: {type: [Number], index: '2d'}
}, base.properties);

var EventSchema = new Schema(properties, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

EventSchema.pre('save', function(next) {
    base.preSave(this);
    next();
});

EventSchema.virtual('coords').get(function(){
    if(this.geoLocation && this.geoLocation.length == 2){
        return {
            latitude: this.geoLocation[0],
            longitude: this.geoLocation[1]
        };
    }
    return {};

});

EventSchema.virtual('permissions')
    .set(function(permissions) {
        this._permissions = permissions;
    })
    .get(function() {
        return this._permissions;
    });

//Each model must define its set of assignable permissions.
//All models inherit basic CRUD permissions
EventSchema.statics = base.permissions;

//Programatically create field permissions
EventSchema.statics.fieldPermissions = _.memoize(function(){
    var permissions = {};

    for (var field in this.schema.paths) {
        if (field == '_id' || field == '__v'){
            continue;
        }

        // permissions[field] = 'update-' + field;
        permissions[field] = {
            'read': 'read-' + field,
            'update': 'update-' + field,
        }

        console.log('creating field permissions', permissions[field]);
    };

    return permissions;
});

//Specifies which permissions are granted to a user over the documents they create
EventSchema.statics.permissionsGrantedOnCreation = function(){
    var grant = [this.readPermission(), this.updatePermission()];
    var fieldPermissions = this.fieldPermissions();
    var cantTouch = ['created', 'createdBy', 'deleted', 'deletedBy', 'published'];

    for (var field in this.schema.paths) {
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
    grant.push(this.readUnpublishedPermission());

    return grant;
};

//Specifies which permissions are granted to a user on cretion
EventSchema.statics.permissionsGrantedOnUserCreation = function(){
    var grant = [this.readPermission(), this.readListPermission()];
    return grant;
};

mongoose.model('Event', EventSchema);
