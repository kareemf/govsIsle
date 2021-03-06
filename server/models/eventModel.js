'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: {type: String, required: true},
    type: {type: String, required: true}, // Activity, Exhibit, Tour, Program/Festival
    description: String,
    visibility: String, //Private/Public
    setupDateTime: Date,
    startDateTime: Date,
    endDateTime: Date,
    cleanupDateTime: Date,
    isReccuring: Boolean,
    isAllDayEvent: Boolean,
    anticipatedAttendance: Number,
    location: String,
    geoLocation: {type: [Number], index: '2d'},
    media: [{type: ObjectId, ref: 'Media'}],
    coverPhoto: {type: ObjectId, ref: 'Media'},
    organizer: {
        name: String,
        email: {
            type: String,
            match: [/.+\@.+\..+/, 'Please enter a valid email']
        },
        phone: String
    },
    tourpointId: String //Entangled
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
EventSchema.statics.fieldPermissions = function(){
    return base.fieldPermissions(this);
}

//Specifies which permissions are granted to a user over the documents they create
EventSchema.statics.permissionsGrantedOnCreation = function(){
    return base.permissionsGrantedOnCreation(this);
};

//Specifies which permissions are granted to a user on creation
EventSchema.statics.permissionsGrantedOnUserCreation = function(){
    return base.permissionsGrantedOnUserCreation(this);
};

EventSchema.statics.permissionsGrantedToAnon = function(){
    var fieldPermissions = this.fieldPermissions();
    var readPermission = this.readPermission();
    var readListPermission = this.readListPermission();

    return [
        readPermission,
        readListPermission,
        fieldPermissions['name'][readPermission],
        fieldPermissions['type'][readPermission],
        fieldPermissions['description'][readPermission],
        fieldPermissions['visibility'][readPermission],
        fieldPermissions['startDateTime'][readPermission],
        fieldPermissions['endDateTime'][readPermission],
        fieldPermissions['isReccuring'][readPermission],
        fieldPermissions['location'][readPermission],
        fieldPermissions['geoLocation'][readPermission],
        fieldPermissions['media'][readPermission],
        fieldPermissions['coverPhoto'][readPermission],
        fieldPermissions['isAllDayEvent'][readPermission],
        fieldPermissions['tourpointId'][readPermission],
        fieldPermissions['organizer.name'][readPermission],
        fieldPermissions['organizer.email'][readPermission],
        fieldPermissions['organizer.phone'][readPermission]
    ].concat(base.permissionsGrantedToAnon(this));
};

EventSchema.statics.load = function(id, callback){
    this.findOne({
        _id: id
    })
    .populate('media', 'slug id')
    .populate('coverPhoto', 'slug id')
    .exec(callback);
};

var Model = mongoose.model('Event', EventSchema);

Model.collection.ensureIndex({
    description : 'text',
    name : 'text'
}, function(error, res) {
    if(error){
        console.error(Model.modelName, 'failed ensureIndex');
    }
    console.log(Model.modelName, 'ensureIndex succeeded with response', res);
});
