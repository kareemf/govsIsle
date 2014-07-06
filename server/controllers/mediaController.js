'use strict';

var mongoose = require('mongoose');

exports.getModelType = function(req, res, next, id) {
    console.log('getModelType');
    next();
};

exports.getModelInstance = function(req, res, next, id) {
    console.log('getModelInstance');
    next();
};

exports.create = function(req, res) {
    console.log('media create');
    return res.jsonp('create');
};
