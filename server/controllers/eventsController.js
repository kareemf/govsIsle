'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Event = mongoose.model('Event'),
    base = require('./baseController')(Event);

/**
 * Find event by id
 */
exports.get = function(req, res, next, id) {
    base.get(req, res, next, id);
};

/**
 * Find event by slug
 */
exports.getBySlug = function(req, res, next, id) {
    base.getByQuery(req, res, next, {slug: id});
};

/**
 * Create a event
 */
exports.create = function(req, res) {
    base.create(req, res);
};

/**
 * Update a event
 */
exports.update = function(req, res) {
    base.update(req, res);
};

/**
 * Delete an event
 */
exports.destroy = function(req, res) {
    base.destroy(req, res);
};

/**
 * Show an event
 */
exports.show = function(req, res) {
    base.show(req, res);
};

/**
 * List of Events
 */
exports.all = function(req, res) {
    var query = null;
    var filter = req.query.filter;

    if(filter){
        if(_.isArray(filter)){
            query = {
                type: {$in: filter}
            };
        }
        else{
            query = {
                type: filter
            };
        }
    }

    base.all(req, res, query);
};

/**
* Publish an Event
*/
exports.publish = function(req, res){
    base.publish(req, res);
};

exports.search = function(req, res){
    base.search(req, res);
};
