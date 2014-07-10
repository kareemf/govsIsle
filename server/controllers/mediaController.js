'use strict';

var fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    Media = mongoose.model('Media'),
    permissionsManager = require('./permissionsManager')(Media);

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
    // console.log('media create req.files:', req.files);
    // return res.jsonp({files: req.files, body: req.body});
    var responseJson = {};
    var fields = [];

    for(var fieldName in req.files){
        var field = req.files[fieldName];
        fields.push(field);
    }
    if(!fields.length){
        return res.jsonp(500, 'Nothing to upload');
    }
    var createMediaFromField = function(field, callback){
        var name = field.originalname;
        var media = new Media(field);
        //TODO: may not want to do this if there are more than one files
        var attribution = req.body.attribution;
        var caption = req.body.caption;
        media.name = name;

        if(attribution){
            media.attribution = attribution;
        }
        if(caption){
            media.caption = caption;
        }

        media.file = fs.readFileSync(field.path);

        media.save(function(err, media){
            if(err){
                responseJson[name] = {
                    status: 500,
                    error: err
                };
            }
            else{
                var mediaJson = media.toObject();
                delete mediaJson.file

                permissionsManager.grantCreatorPermissions(req.user, media);

                responseJson[name] = {
                    status: 200,
                    media: mediaJson
                };
            }
            callback();
        });
    };

    var addMediaToDoc = function(err){
        var doc = req.doc;
        var mediaResponses = [];

        if(!doc){
            responseJson.error = 'Failed to find doc for media upload';
            return res.jsonp(responseJson);
        }
        for(var name in responseJson){
            var mediaResponse = responseJson[name];
            mediaResponses.push(mediaResponse);
        }

        var updatedAssociatedDoc = function(mediaResponse, callback){
            if (mediaResponse.status != 200){
                return callback();
            }

            doc.media.push(mediaResponse.media.id);
            doc.save(function(err, doc){
                responseJson.doc = {id: doc.id};
                if(err){
                    mediaResponse.status = 500;
                    mediaResponse.error = err;
                }
                callback();
            });
        };

        var sendResponse = function(err){
            return res.jsonp(responseJson);
        };

        async.each(mediaResponses, updatedAssociatedDoc, sendResponse);
    };

    async.each(fields, createMediaFromField, addMediaToDoc);
};
