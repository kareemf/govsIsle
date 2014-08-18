'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend(base.properties, {
    name: String,
    type: String, //Weather (advisory), Ferry (delay)
    description: String,
    startDateTime: Date,
    endDateTime: Date,
    isReccuring: Boolean,
    location: String,
    geoLocation: {type: [Number], index: '2d'},
    tourpointId: String //Entangled
});
var AlertSchema = new Schema(properties);

var AlertSchema = new Schema(properties, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

AlertSchema.virtual('permissions')
    .set(function(permissions) {
        this._permissions = permissions;
    })
    .get(function() {
        return this._permissions;
    });

AlertSchema.statics = base.permissions;

//Programatically create field permissions
AlertSchema.statics.fieldPermissions = function(){
    return base.fieldPermissions(this);
}

//Specifies which permissions are granted to a user over the documents they create
AlertSchema.statics.permissionsGrantedOnCreation = function(){
    return base.permissionsGrantedOnCreation(this);
};

//Specifies which permissions are granted to a user on creation
AlertSchema.statics.permissionsGrantedOnUserCreation = function(){
    return base.permissionsGrantedOnUserCreation(this);
};

AlertSchema.statics.permissionsGrantedToAnon = function(){
    var fieldPermissions = this.fieldPermissions();
    var readPermission = this.readPermission();
    var readListPermission = this.readListPermission();

    return [
        readPermission,
        readListPermission,
        fieldPermissions['type'][readPermission],
        fieldPermissions['description'][readPermission],
        fieldPermissions['startDateTime'][readPermission],
        fieldPermissions['endDateTime'][readPermission],
        fieldPermissions['isReccuring'][readPermission],
        fieldPermissions['location'][readPermission],
        fieldPermissions['geoLocation'][readPermission],
    ];
};

mongoose.model('Alert', AlertSchema);
