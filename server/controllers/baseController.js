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

    var ascertainUserPermissions = function(user, doc){
        var canDo = [];
        // console.log('checking permissions');
        if(user.permissions){
            // console.log('user has permissions');
            user.permissions.forEach(function(permission){
                // console.log('permission', permission);

                if(!permission.documentType){
                    // console.log('malformed permission: did not specify documentType');
                    return;
                }
                if(permission.documentType.toLowerCase() != modelName){
                    // console.log('permission documentType !=', modelName);
                    return;
                }

                var documentId = permission.documentId;
                if(documentId){
                    if(!doc.id || !documentId.equals(doc.id)) {
                        // console.log('documentId !=', doc.id);
                        return;
                    }
                }
                // console.log('adding permissions', permission.canDo);
                canDo = canDo.concat(permission.canDo);
            });
        }
        // console.log('returning permissions', _.uniq(canDo));
        return _.uniq(canDo);
    };

    var ascertainBasicPermissions = function(doc){
        var canDo = [];
        if(doc.published){
            canDo.push('read');
        }
        return canDo;
    };

    var ascertainPermissions = function(user, doc){
        var permissions = ascertainBasicPermissions(doc);
        if(user){
            permissions = _.uniq(permissions.concat(ascertainUserPermissions(user, doc)));
        }
        return permissions;
    };

    var removeNonPermitedFields = function(permissions, doc){
        var modelFieldPermissions =  Model.fieldPermissions();
        var readPermission = Model.readPermission();

        for (var field in Model.schema.paths) {
            if (field == '_id' || field == '__v'){
                continue;
            }

            var requiredPermission = modelFieldPermissions[field][readPermission];
            if(!_.contains(permissions, requiredPermission)){
                console.log('dont have', requiredPermission, 'for field', field);
                delete doc[field];
                // doc[field] = null;

            }
        };

        return doc;
    };

    var removeNonPermitedUpdateFields = function(permissions, doc, body, params){
        var modelFieldPermissions =  Model.fieldPermissions();
        var readPermission = Model.readPermission();


        for(var field in body) {
            if (field == '_id' || field == '__v'){
                //can't manually update id or version
                delete body[field];
                continue;
            }
            if(params[field] != doc[field]){
                console.log('DIRTY FIELD', field);

                var requiredPermission = modelFieldPermissions[field][readPermission];

                if(!_.contains(permissions, requiredPermission)){
                    console.log('DONT HAVE permission', requiredPermission, 'to update', field);
                    delete body[field];
                }
                else{
                    console.log('updating field', field);
                    // doc[field] = req.params[field];
                }
            }
        }

        return body;
    };

    var buildPermittedFieldsSelectStatement = function(permissions){
        var modelFieldPermissions =  Model.fieldPermissions();
        var readPermission = Model.readPermission();
        var readableFields = [];

        for (var field in Model.schema.paths) {
            if (field == '_id' || field == '__v'){
                readableFields.push(field);
                continue;
            }

            var requiredPermission = modelFieldPermissions[field][readPermission];
            if(_.contains(permissions, requiredPermission)){
                // console.log('you have', requiredPermission, 'for field', field);

                readableFields.push(field);
            }
        };

        return readableFields.join(' ');
    }

    return {
        /**
         * Find doc by id
         */
        get: function(req, res, next, id) {
            console.log('doc by id', id);

            var callback = function(err, doc) {
                if (err) {return next(err);}
                if (!doc) {return next(new Error('Failed to load doc ' + id));}

                var permissions = ascertainPermissions(req.user, doc);
                if(!_.contains(permissions, Model.readPermission())){
                    return res.send(403, 'User does not have read access to this content');
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
                var permissions = ascertainPermissions(user, doc);

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

            var permissions = ascertainPermissions(req.user, doc);

            if(!_.contains(permissions, Model.createPermission())){
                return res.send(403, 'User does not have create access to this content type');
            }

            doc.save(function(err) {
                if (err) {
                    var data = {errors: err.errors};
                    data[modelName] = doc;
                    return new Error('Failed to create doc. Error: ' + err);
                } else {
                    if(user){
                        //TODO: work with model to get basic permissions. move to separate method
                        user.permissions.push({
                            documentType: modelName,
                            documentId: doc.id,
                            canDo: [
                                Model.readPermission(),
                                Model.updatePermission()
                            ]
                        });

                        user.save(function (err) {
                          if (err) return new Error('Failed to update user permissions. Error: ' + err);
                          console.log('added permissions to user for doc', doc.id);
                        });
                    }

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
            var permissions = ascertainPermissions(req.user, doc);
            var body = req.body;

            if(!_.contains(permissions, Model.updatePermission())){
                return res.send(403, 'User does not have update access to this content');
            }

            //prevent user from updating fields to which they dont have access
            //ex prevent user from updating his/her own permissions
            body = removeNonPermitedUpdateFields(permissions, doc, body, req.params);

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
            var permissions = ascertainPermissions(req.user, doc);

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

            var permissions = ascertainPermissions(req.user, doc);

            //returning a POJO instead of mongoose model instance
            var _doc = doc.toObject();

            //remove all field for which the user does not have read access
             _doc = removeNonPermitedFields(permissions, _doc);

            res.jsonp(_doc);
        },

        /**
         * List of docs
         */
        all: function(req, res) {
            //only collection-levle permissions are relevant at this point
            var permissions = ascertainUserPermissions(req.user, null);

            if(!_.contains(permissions, Model.readListPermission())){
                return res.send(403, 'User does not have read access to '+ modelName +' list');
            }

            //only going to select fields that user has permission to view
            var select = buildPermittedFieldsSelectStatement(permissions);
            // console.log('all select:', select);

            Model.find().sort('-created').select(select).populate('user', 'name username').exec(function(err, docs) {
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
            var permissions = ascertainPermissions(user, doc);

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
