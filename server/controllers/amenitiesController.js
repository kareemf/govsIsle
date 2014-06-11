'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Amenity = mongoose.model('Amenity'),
    base = require('./baseController')(Amenity);

/**
 * Find amenity by id
 */
exports.get = function(req, res, next, id) {
    base.get(req, res, next, id);
};

/**
 * Create a amenity
 */
exports.create = function(req, res) {
    base.create(req, res);
};

/**
 * Update a amenity
 */
exports.update = function(req, res) {
    base.update(req, res);
};

/**
 * Delete an amenity
 */
exports.destroy = function(req, res) {
    base.destroy(req, res);
};

/**
 * Show an amenity
 */
exports.show = function(req, res) {
    base.show(req, res);
};

/**
 * List of amenities
 */
exports.all = function(req, res) {
    base.all(req, res);
};
