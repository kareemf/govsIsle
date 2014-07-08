'use strict';

var fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    Media = mongoose.model('Media');

exports.getModelType = function(req, res, next, modelType) {
    // console.log('getModelType');

    var Model = mongoose.model(modelType);
    // console.log('media model', Model);

    if(Model){
        req.model = Model;
    }

    next();
};

exports.getModelInstance = function(req, res, next, id) {
    // console.log('getModelInstance');

    var Model = req.model;
    if(Model){
        Model.findOne({_id: id})
        .exec(function(err, doc){
            // console.log('getModelInstance err:', err, 'doc:', doc);

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
    console.log('media create req.files:', req.files);
    // return res.jsonp({files: req.files, body: req.body});
    var responseJson = {};
    var fields = []

    for(var fieldName in req.files){
        var field = req.files[fieldName];
        fields.push(field);
    }

    var createMediaFromField = function(field, callback){
        var name = field.originalname;
        var media = new Media(field);

        media.name = name;
        //media.attribution = '';
        //media.caption = '';

        media.file = fs.readFileSync(field.path);

        media.save(function(err, media){
            if(err){
                responseJson[name] = {
                    status: 500,
                    error: err
                };
            }
            else{
                responseJson[name] = {
                    status: 200,
                    meida: media.toObject()
                };
            }
            callback();
        });
    };

    var sendResponse = function(err){
        res.jsonp(responseJson);
    };

    async.each(fields, createMediaFromField, sendResponse);
};
