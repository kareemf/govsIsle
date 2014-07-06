'use strict';

var mongoose = require('mongoose');

exports.getModelType = function(req, res, next, modelType) {
    console.log('getModelType');

    var Model = mongoose.model(modelType);
    console.log('media model', Model);

    if(Model){
        req.model = Model;
    }

    next();
};

exports.getModelInstance = function(req, res, next, id) {
    console.log('getModelInstance');

    var Model = req.model;
    if(Model){
        Model.findOne({_id: id})
        .exec(function(err, doc){
            console.log('getModelInstance err:', err, 'doc:', doc);
            if(err){
                return res.send(500, err);
            }
            if(!doc){
                return res.send(500, 'Unable to find', Model.modelName, 'with id', id);
            }

            req.doc = doc;
            next();
        });
    }
};

exports.create = function(req, res) {
    console.log('media create');
    return res.jsonp('create');
};
