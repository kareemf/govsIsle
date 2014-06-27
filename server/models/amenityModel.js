'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: String,
    type: String, // Food, Beverage
    description: String,
    hours: String,
    specialities: [String], //Vegan, Kosher, etc
    location: String,
    geoLocation: {type: [Number], index: '2d'}
}, base.properties);
var AmenitySchema = new Schema(properties);

AmenitySchema.pre('save', function(next) {
    base.preSave(this);
    next();
});

mongoose.model('Amenity', AmenitySchema);
