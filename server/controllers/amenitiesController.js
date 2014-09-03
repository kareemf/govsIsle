'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    Amenity = mongoose.model('Amenity'),
    base = require('./baseController')(Amenity);

exports.get = function(req, res, next, id) {
    base.get(req, res, next, id);
};

exports.getBySlug = function(req, res, next, id) {
    base.getByQuery(req, res, next, {slug: id});
};

exports.create = function(req, res) {
    base.create(req, res);
};

exports.update = function(req, res) {
    base.update(req, res);
};

exports.destroy = function(req, res) {
    base.destroy(req, res);
};

exports.show = function(req, res) {
    base.show(req, res);
};

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

exports.publish = function(req, res){
    base.publish(req, res);
};

exports.search = function(req, res){
    base.search(req, res);
};
