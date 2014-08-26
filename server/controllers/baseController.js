'use strict';

var _ = require('lodash'),
    redis = require('../config/redis'),
    Lazy = require('lazy.js');

var PaginationResponse = function(items, total, limit, offset){
    this.items = items;
    this.total = total;
    this.offset = offset ? offset : 0;
    this.limit = limit ? limit : 20;
};

module.exports = function(Model){
    //TODO: may be a better way to get property name
    var modelName = Model.modelName.toLowerCase(),
        permissionsManager = require('./permissionsManager')(Model);

    var load = function(id, callback){
        Model.findOne({
            _id: id
        }).populate('media', 'slug id').exec(callback);
    };

    var redisClient = redis.createClient();

    var redisPublishOperation = function(doc, operation){
        var redisEntityKey = modelName + '.' + operation;
        console.log(redisEntityKey, doc._id);
        return redisClient.publish(redisEntityKey, JSON.stringify(doc));
    };

    return {
        /**
         * Find doc by id
         */
        get: function(req, res, next, id) {
            console.log('doc by id', id);

            var callback = function(err, doc) {
                if (err) {return next(err);}
                if (!doc) {
                    return next(new Error('Failed to load doc ' + id + 'for model ' + modelName));}

                var permissions = permissionsManager.ascertainPermissions(req.user, doc);
                if(!_.contains(permissions, Model.readPermission())){
                    return res.send(403, 'User does not have read access to this content');
                }

                //prevent user from viewing unpublished content unless they have
                //permission to do so. this happens after the query is already
                //executed because the user may have doc-level readUnpublished
                //permission without having collection level access
                if(!doc.published && !_.contains(permissions, Model.readUnpublishedPermission())){
                    return res.send(403, 'Content not yet available');
                }

                //ex req.post = post
                doc.permissions = permissions;
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

            Model.findOne(query)
                .populate('media', 'slug id')
                .populate('coverPhoto', 'slug id')//TODO: move to Model specific location
                .exec(function(err, doc){
                if(err){ return next(err);}
                if (!doc) {return next(new Error('Failed to load doc by query' + query));}

                var user = req.user;
                var permissions = permissionsManager.ascertainPermissions(user, doc);

                //prevent user from viewing unpublished content unless they have permission to do so.
                if(!doc.published && !_.contains(permissions, Model.readUnpublishedPermission())){
                    return res.send(403, 'Content not yet available');
                }

                // console.log('doc permissions', permissions);
                if(!_.contains(permissions, Model.readPermission())){
                    return res.send(403, 'User does not have read access to this content');
                }

                doc.permissions = permissions;
                req[modelName] = doc;

                next();
            });
        },

        /**
         * Create a doc
         */
        create: function(req, res) {
            var doc = new Model(req.body);
            var user = req.user;

            if(!_.isUndefined(req.user)){
                doc.createdBy = user._id;
            }

            var permissions = permissionsManager.ascertainPermissions(req.user, doc);

            if(!_.contains(permissions, Model.createPermission())){
                return res.send(403, 'User does not have create access to this content type');
            }

            doc.save(function(err, doc) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to create doc. Error: ' + err);
                } else {
                    permissionsManager.grantCreatorPermissions(req.user, doc);
                    doc.permissions = permissions;

                    redisPublishOperation(doc, 'created');
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
            var permissions = permissionsManager.ascertainPermissions(req.user, doc);
            var body = req.body;
            var files = req.files;

            if(!_.contains(permissions, Model.updatePermission())){
                return res.send(403, 'User does not have update access to this content');
            }

            //prevent user from updating fields to which they dont have access
            //ex prevent user from updating his/her own permissions
            body = permissionsManager.removeNonPermitedUpdateFields(permissions, doc, body, req.params);

            doc.edit = new Date();
            doc.editedBy = user.id;
            doc = _.extend(doc, body);

            //do not store null values. unpermitted updates have already been filtered,
            //so there shouln't be any unintended deletes
            for(var field in body){
                if(body[field] === null){
                    //console.log('deleting field', field);
                    doc[field] = undefined;
                }
            }

            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    console.error('Failed to update', modelName, 'doc', doc.id, '. Error: ' + err);
                    return res.send(500);
                } else {
                    //if a cover photo, etc, was uploaded, create the Media instance.
                    if(files && Object.keys(files).length) {
                        req.doc = doc;
                        req.model = Model;

                        var mediaController = require('./mediaController');
                        mediaController.create(req, res, function (mediaResponseJson) {
                            redisPublishOperation(doc, 'updated');
                            res.jsonp(doc);
                        });
                    }
                    else{
                        redisPublishOperation(doc, 'updated');
                        res.jsonp(doc);
                    }
                }
            });
        },

        /**
         * Delete an doc
         */
        destroy: function(req, res) {
            var doc = req[modelName];
            var permissions = permissionsManager.ascertainPermissions(req.user, doc);

            if(!_.contains(permissions, Model.deletePermission())){
                return res.send(403, 'User does not have delete access to this content');
            }

            doc.remove(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to destroy doc. Error: ' + err);
                } else {
                    redisPublishOperation(doc, 'deleted');
                    res.jsonp(doc);
                }
            });
        },

        /**
         * Show a doc
         */
        show: function(req, res, options) {
            var doc = req[modelName];
            console.log('showing doc', doc);

            var permissions = permissionsManager.ascertainPermissions(req.user, doc);

            //returning a POJO instead of mongoose model instance
            var _doc = doc.toObject();

            if(options && options.omit){
                options.omit.forEach(function(ommitedField){
                    delete _doc[ommitedField];
                });
            }

            //remove all field for which the user does not have read access
            _doc = permissionsManager.removeNonPermitedFields(permissions, _doc);

            doc.permissions = permissions;
            res.jsonp(_doc);
        },

        /**
         * List of docs
         */
        all: function(req, res, queryParams) {
            //only collection-levle permissions are relevant at this point
            var permissions = permissionsManager.ascertainPermissions(req.user, null);

            if(!_.contains(permissions, Model.readListPermission())){
                return res.send(403, 'User does not have read access to '+ modelName +' list');
            }

            var query = Model.find();
            var countQuery = Model.find();

            //allow the execution of user-provided queries
            if(queryParams){
                query.where(queryParams);
                countQuery.where(queryParams);
            }

            //prevent user from viewing unpublished content unless they have permission to do so
            if(!_.contains(permissions, Model.readUnpublishedPermission())){
                query.exists('published');
                countQuery.exists('published');
            }

            //handle sort, limit, and offset query parameters
            var sort = req.query.sort ? req.query.sort : '-created';
            query.sort(sort);

            if(req.query.limit) {
                query.limit(req.query.limit);
            }

            if(req.query.offset) {
                query.skip(req.query.offset);
            }

            //only going to select fields that user has permission to view
            var select = permissionsManager.buildPermittedFieldsSelectStatement(permissions);
            // console.log('all select:', select);

            query.select(select)
            .populate('media', 'slug id')
            .populate('coverPhoto', 'slug id')//TODO: move to Model specific location
            .populate('user', 'name username')
            .exec(function(err, docs) {
                if (err) {
                    return res.render('error', {
                        status: 500
                    });
                }

                //populate permissions for each doc
                Lazy(docs).each(function(doc){
                    doc.permissions = permissionsManager.ascertainPermissions(req.user, doc);
                });

                if(req.query.paginate){
                    return countQuery.count(function(err, total){
                        if (err) {
                            return res.render('error', {
                                status: 500
                            });
                        }
                        return res.jsonp(new PaginationResponse(
                            docs,
                            total,
                            Number(req.query.limit),
                            Number(req.query.offset)
                        ));
                    });
                }

                return res.jsonp(docs);

            });
        },

        /**
        * Publish a doc
        */
        publish: function(req, res){
            console.log('attempting to publish', modelName, req[modelName]);

            var user = req.user;
            var doc = req[modelName];
            var permissions = permissionsManager.ascertainPermissions(user, doc);

            if(!_.contains(permissions, Model.publishPermission())){
                return res.send(403, 'User does not have permission to publish this content');
            }

            doc.published = new Date();
            doc.publishedBy = req.user.id;
            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to update doc. Error: ' + err);
                } else {
                    redisPublishOperation(doc, 'updated');
                    res.jsonp(doc);
                }
            });
        },
    };
};
