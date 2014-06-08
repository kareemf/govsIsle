'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseModel');

var properties = _.extend(base.properties, {
    name: String,
    type: String, // Food, Beverage
    description: String,
    hours: String,
    specialities: [String], //Vegan, Kosher, etc
    location: String,
    geoLocation: {type: [Number], index: '2d'}
});
var AmenitySchema = new Schema(properties);

mongoose.model('Amenity', AmenitySchema);
