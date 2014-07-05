'use strict';

var _ = require('lodash');

module.exports = function(Model){
    //TODO: may be a better way to get property name
    var modelName = Model.modelName.toLowerCase(),
        permissionsManager = require('./permissionsManager')(Model);

    var load = function(id, callback){
        Model.findOne({
            _id: id
        }).exec(callback);
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

                var permissions = permissionsManager.ascertainPermissions(req.user, doc);
                if(!_.contains(permissions, Model.readPermission())){
                    return res.send(403, 'User does not have read access to this content');
                }

                //prevent user from viewing unpublished content unless they have
                //permission to do so. this happens after the query is already
                //executed because the user may have doc-level readUnpublished
                //permission without having collection level access
                if(!_.contains(permissions, Model.readUnpublishedPermission())){
                    return res.send(403, 'Content not yet available');
                }

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

                var user = req.user;
                var permissions = permissionsManager.ascertainPermissions(user, doc);

                //prevent user from viewing unpublished content unless they have permission to do so.
                if(!_.contains(permissions, Model.readUnpublishedPermission())){
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

            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to create doc. Error: ' + err);
                } else {
                    permissionsManager.grantCreatorPermissions(req.user, doc);
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

            if(!_.contains(permissions, Model.updatePermission())){
                return res.send(403, 'User does not have update access to this content');
            }

            //prevent user from updating fields to which they dont have access
            //ex prevent user from updating his/her own permissions
            body = permissionsManager.removeNonPermitedUpdateFields(permissions, doc, body, req.params);

            doc.edit = new Date();
            doc.editedBy = user.id;
            doc = _.extend(doc, body);
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

            var permissions = permissionsManager.ascertainPermissions(req.user, doc);

            //returning a POJO instead of mongoose model instance
            var _doc = doc.toObject();

            //remove all field for which the user does not have read access
             _doc = permissionsManager.removeNonPermitedFields(permissions, _doc);

            res.jsonp(_doc);
        },

        /**
         * List of docs
         */
        all: function(req, res, queryParams) {
            //only collection-levle permissions are relevant at this point
            var permissions = permissionsManager.ascertainUserPermissions(req.user, null);

            if(!_.contains(permissions, Model.readListPermission())){
                return res.send(403, 'User does not have read access to '+ modelName +' list');
            }

            var query = Model.find();

            //allow the execution of user-provided queries
            if(queryParams){
                query.where(queryParams);
            }

            //prevent user from viewing unpublished content unless they have permission to do so
            if(!_.contains(permissions, Model.readUnpublishedPermission())){
                query.exists('published');
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

            query.select(select).populate('user', 'name username').exec(function(err, docs) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(docs);
                }
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
    };
};
