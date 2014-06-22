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

EventSchema.virtual('coords').get(function(){
    if(this.geoLocation && this.geoLocation.length == 2){
        return {
            latitude: this.geoLocation[0],
            longitude: this.geoLocation[1]
        };
    }
    return {};

});

mongoose.model('Event', EventSchema);
