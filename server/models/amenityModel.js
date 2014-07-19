'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: String,
    type: String, // Food, Beverage
    description: String,
    hours: String,
    specialities: [String], //Vegan, Kosher, etc
    location: String,
    geoLocation: {type: [Number], index: '2d'},
    media: [{type: ObjectId, ref: 'Media'}],
    coverPhoto: {type: ObjectId, ref: 'Media'}
}, base.properties);
var AmenitySchema = new Schema(properties);

var AmenitySchema = new Schema(properties, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

AmenitySchema.pre('save', function(next) {
    base.preSave(this);
    next();
});

AmenitySchema.virtual('permissions')
    .set(function(permissions) {
        this._permissions = permissions;
    })
    .get(function() {
        return this._permissions;
    });

AmenitySchema.statics = base.permissions;

//Programatically create field permissions
AmenitySchema.statics.fieldPermissions = function(){
    return base.fieldPermissions(this);
}

//Specifies which permissions are granted to a user over the documents they create
AmenitySchema.statics.permissionsGrantedOnCreation = function(){
    return base.permissionsGrantedOnCreation(this);
};

//Specifies which permissions are granted to a user on creation
AmenitySchema.statics.permissionsGrantedOnUserCreation = function(){
    return base.permissionsGrantedOnUserCreation(this);
};

AmenitySchema.statics.permissionsGrantedToAnon = function(){
    var fieldPermissions = this.fieldPermissions();
    var readPermission = this.readPermission();
    var readListPermission = this.readListPermission();

    return [
        readPermission,
        readListPermission,
        fieldPermissions['name'][readPermission],
        fieldPermissions['type'][readPermission],
        fieldPermissions['description'][readPermission],
        fieldPermissions['hours'][readPermission],
        fieldPermissions['specialities'][readPermission],
        fieldPermissions['location'][readPermission],
        fieldPermissions['geoLocation'][readPermission],
        fieldPermissions['media'][readPermission],
    ];
};

mongoose.model('Amenity', AmenitySchema);
