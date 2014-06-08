'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseModel');

var properties = _.extend(base.properties, {
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
});
var EventSchema = new Schema(properties);

mongoose.model('Event', EventSchema);
