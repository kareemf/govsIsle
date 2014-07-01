'use strict';

var _ = require('lodash');

module.exports = function(Model){
    //TODO: may be a better way to get property name
    var modelName = Model.modelName.toLowerCase();

    var load = function(id, callback){
        Model.findOne({
            _id: id
        }).exec(callback);
    };

    var determinePermissions = function(user, doc){
        var canDo = [];
        if(user.permissions){
            user.permissions.forEach(function(permission){
                if(permission.collectionName.toLowerCase() != modelName){
                    return;
                }

                var documentId = permission.documentId;
                if(documentId){
                    if(!documentId.equals(doc.id)) {
                        return;
                    }
                }

                canDo.contact(permission.canDo);
            });
        }
        return _.uniq(canDo);
    };

    return {
        /**
         * Find doc by id
         */
        get: function(req, res, next, id) {
            console.log('doc by id', id);

            var callback = function(err, doc) {
                if (err) {return next(err);}
                if (!doc) {return next(new Error('Failed to load doc ' + id));}
                //ex req.post = post
                req[modelName] = doc;
                // console.log('req modelName', modelName);
                next();
            };

            if(!_.isUndefined(Model.load)){
                Model.load(id, callback);
            }
            else{
                load(id, callback);
            }
        },

        /*
        * Find doc by query object
        */
        getByQuery: function(req, res, next, query){
            console.log('getByField query', query);

            Model.findOne(query).exec(function(err, doc){
                if(err){ return next(err);}
                if (!doc) {return next(new Error('Failed to load doc by query' + query));}
                req[modelName] = doc;

                var user = req.user;
                if(user){
                    doc.permissions = determinePermissions(user, doc);
                }

                next();
            });
        },

        /**
         * Create a doc
         */
        create: function(req, res) {
            var doc = new Model(req.body);

            if(!_.isUndefined(req.user)){
                doc.createdBy = req.user._id;
            }

            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to create doc. Error: ' + err);
                } else {
                    res.jsonp(doc);
                }
            });
        },

        /**
         * Update a doc
         */
        update: function(req, res) {
            var doc = req[modelName];
            var user = req.user;

            doc.edit = new Date();
            doc.editedBy = user.id;
            doc = _.extend(doc, req.body);
            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to update doc. Error: ' + err);
                } else {
                    res.jsonp(doc);
                }
            });
        },

        /**
         * Delete an doc
         */
        destroy: function(req, res) {
            var doc = req[modelName];

            doc.remove(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to destroy doc. Error: ' + err);
                } else {
                    res.jsonp(doc);
                }
            });
        },

        /**
         * Show a doc
         */
        show: function(req, res) {
            var doc = req[modelName];
            console.log('showing doc', doc);
            res.jsonp(doc);
        },

        /**
         * List of docs
         */
        all: function(req, res) {
            Model.find().sort('-created').populate('user', 'name username').exec(function(err, docs) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(docs);
                }
            });
        }
    };
};
