'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend(base.properties, {
    description: String,
    startDateTime: Date,
    endDateTime: Date,
    isReccuring: Boolean,
    location: String,
    geoLocation: {type: [Number], index: '2d'}
});
var AlertSchema = new Schema(properties);

mongoose.model('Alert', AlertSchema);
