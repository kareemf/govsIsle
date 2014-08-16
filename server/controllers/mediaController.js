'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    Media = mongoose.model('Media'),
    base = require('./baseController')(Media),
    permissionsManager = require('./permissionsManager')(Media),
    Imagemin = require('imagemin');


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
                console.log('getModelInstance err:', err);
                return res.send(500, err);
            }
            if(!doc){
                console.log('getModelInstance failed to find doc by id');
                return res.send(500, 'Unable to find', Model.modelName, 'with id', id);
            }

            req.doc = doc;
            next();
        });
    }
};

exports.create = function(req, res, _callback) {
    console.log('media create req.files:', req.files);
    // return res.jsonp({files: req.files, body: req.body});
    var Model = req.model;
    var modelFieldNames = Object.keys(Model.schema.paths);
    var files = req.files;
    var fields = [];
    var responseJson = {};

    for(var fieldName in files){
        var field = files[fieldName];

        //TODO: handle case where field is an array

        //make sure the field user is attempting to update:
        //1. is part of the model
        if(_.contains(modelFieldNames, fieldName)){
            //2. is a Media reference
            //TODO: make file path is Media ref

            //3. user has permission to update
            //TODO: permission check

            fields.push(field);
        }
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

        //Media instances are published by default
        media.published = new Date();
        media.publishedBy = req.user.id;

        media.save(function(err, media){
            if(err){
                if(responseJson) {
                    responseJson[name] = {
                        status: 500,
                        error: err
                    };
                }
            }
            else{
                var mediaJson = media.toObject();
                //do not want the JSON response to contain the file binary data
                delete mediaJson.file;

                permissionsManager.grantCreatorPermissions(req.user, media);
                if(responseJson) {
                    responseJson[name] = {
                        status: 200,
                        fieldName: field.fieldname,
                        media: mediaJson
                    };
                }
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

            //allow user to Update any arbitrary Media field
            //doc.media.push(mediaResponse.media.id);
            var fieldName = mediaResponse.fieldName;
            if(_.isArray(doc[fieldName])){
                doc[fieldName].push(mediaResponse.media.id);
            }
            else{
                doc[fieldName] = mediaResponse.media.id;
            }

            doc.save(function(err, doc){
                if(err){
                    mediaResponse.status = 500;
                    mediaResponse.error = err;
                }
                if(doc){
                    responseJson.doc = {id: doc.id};
                }

                callback();
            });
        };

        var sendResponse = function(err){
            if(!_callback){
                return res.jsonp(responseJson);
            }
            return _callback(responseJson);
        };

        async.each(mediaResponses, updatedAssociatedDoc, sendResponse);
    };

    async.each(fields, createMediaFromField, addMediaToDoc);
};

exports.get = function(req, res, next, id) {

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        base.get(req, res, next, id);
    }
    else{
        base.getByQuery(req, res, next, {slug: id});
    }
};

exports.getBySlug = function(req, res, next, id) {
    base.getByQuery(req, res, next, {slug: id});
};

exports.all = function(req, res) {
    base.all(req, res);
};

exports.update = function(req, res) {
    base.update(req, res);
};

exports.destroy = function(req, res) {
    base.destroy(req, res);
};

exports.show = function(req, res) {
    var options = {
        omit: ['file']
    };

    base.show(req, res, options);
};

exports.render = function(req, res) {
    var media = req.media;
    res.contentType(media.mimetype);
    res.send(media.file);
};

exports.publish = function(req, res){
    base.publish(req, res);
};

exports.compressImage = function(filename, img){
    var fileExtention = filename.substr(-3).toLocaleLowerCase();
    var imagemin = new Imagemin();

    switch(fileExtention){
        case 'gif':
            imagemin.src('').
            dest('').
            user(Imagemin.gifsicle());
        break;
        case 'jpg':
            imagemin.src('').
            dest('').
            use(Imagemin.jpegtran({ progressive: true }));
        break;
        case 'png':
            imagemin.src('').
            dest('').
            use(Imagemin.optipng({ optimizationLevel: 7 }));
        break;
        default:
            console.log("Not a recommanded file type or make sure the file extention is part of the name");
        break;
    }
    imagemin.optimize(function (err, file) {
        if (err) {
            throw err;
        }
        console.log(file);
    });
};

