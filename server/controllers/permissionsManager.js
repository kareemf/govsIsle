'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    baseContentModel = require('../models/baseContentModel');


module.exports = function(Model){
    if(Model){
        var modelName = Model.modelName.toLowerCase();
    }

    //Given a list of user/role permissions, return the subset that pertains to
    //the specified doc/Model
    var _relevantPermissions = function(permissions, doc){
        if(!permissions){
            // console.log('no permissions')
            return [];
        }

        var canDo = [];
        permissions.forEach(function(permission){
            // console.log('permission', permission);

            if(!permission.documentType){
                // console.error('malformed permission: did not specify documentType:', permission);
                return;
            }
            if(permission.documentType.toLowerCase() != modelName){
                // console.log('permission documentType !=', modelName);
                return;
            }

            var documentId = permission.documentId;
            if(documentId){
                if(!doc || !documentId.equals(doc.id)) {
                    //this permission is meant to be applied to a specific doc
                    //either no doc was specified or doc does not match permission

                    // console.log('documentId !=', doc.id);
                    return;
                }
            }
            // console.log('adding permissions', permission.canDo);
            canDo = canDo.concat(permission.canDo);
        });
        return canDo;
    };

    return {
        /*Determine what the specified user can do to this doc*/
        ascertainUserPermissions: function(user, doc){
            var canDo = [];
            if(!user){
                return canDo;
            }
            // console.log('checking permissions');
            if(user.permissions){
                // console.log('user has permissions');
                canDo = canDo.concat(_relevantPermissions(user.permissions, doc));
            }
            if(user.roles){
                // console.log('user has roles', user.roles);
                user.roles.forEach(function(role){
                    canDo = canDo.concat(_relevantPermissions(role.permissions, doc))
                });
            }
            // console.log('returning permissions', _.uniq(canDo));
            return _.uniq(canDo);
        },

        /*Determine what any user - authenticated or not - can do to this doc*/
        ascertainBasicPermissions: function(doc){
            var canDo = [];
            if(doc && doc.published){
                canDo.push(Model.readPermission());
            }

            if(Model.permissionsGrantedToAnon){
                canDo = canDo.concat(Model.permissionsGrantedToAnon());
            }
            return canDo;
        },

        /*Determine what permissions a user has over a specic doc*/
        ascertainPermissions: function(user, doc){
            var permissions = this.ascertainBasicPermissions(doc);
            if(user){
                permissions = _.uniq(permissions.concat(this.ascertainUserPermissions(user, doc)));
            }
            return permissions;
        },

        /*Before sending a doc to a user, redact fields that they dont have read access to*/
        removeNonPermitedFields: function(permissions, doc){
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
        },

        /*Before commiting a user's update, remove fields that they don't have write access to*/
        removeNonPermitedUpdateFields: function(permissions, doc, body, params){
            var modelFieldPermissions =  Model.fieldPermissions();
            var updatePermission = Model.updatePermission();

            for(var field in body) {
                if(!body.hasOwnProperty(field)){
                    continue;
                }

                if (field == '_id' || field == '__v'){
                    //can't manually update id or version
                    delete body[field];
                    continue;
                }

                if(body[field] != doc[field]){
                    console.log('DIRTY FIELD', field);

                    if(!modelFieldPermissions[field]){
                        console.log('attempting to update field "', field, '" that is not part of the model', Model.modelName);
                        delete body[field];
                        continue;
                    }

                    var requiredPermission = modelFieldPermissions[field][updatePermission];
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
        },

        /*Return a string containing the field names that a user has permission to view*/
        buildPermittedFieldsSelectStatement: function(permissions){
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
        },

        /*Grant elevated permissions to a document's creator*/
        grantCreatorPermissions: function(user, doc){
            if(user){
                //TODO: don't do this for admin (they should already have access)
                user.permissions.push({
                    documentType: modelName,
                    documentId: doc.id,
                    canDo: Model.permissionsGrantedOnCreation()
                });

                user.save(function (err) {
                  if (err) return new Error('Failed to update user permissions. Error: ' + err);
                  console.log('added permissions to user for doc', doc.id);
                });
            }
        },

        /*Grant basic read-only access to a newly registered user*/
        grantBasicPermissions: function(){
            var permissions = [];
            for(var model in mongoose.models){
                var Model = mongoose.model(model);

                //If a Model specifies permissions to grant to all users, assign them now
                if(Model.permissionsGrantedOnUserCreation){
                    var _permissions = Model.permissionsGrantedOnUserCreation();

                    permissions.push({
                        documentType: Model.modelName.toLowerCase(),
                        canDo: _permissions
                    });

                    // console.log(Model.collection.name, 'permissionsGrantedOnUserCreation:', _permissions);
                    // console.log('permissions', permissions);
                }
            };
            return permissions;
            // console.log('permissionsGrantedOnUserCreation:', permissions);
        },

        /*Grant all field read and write permissions to a content administrator*/
        grantAllFieldPermissions: function(){
            var permissions = [];

            for(var model in mongoose.models){
                var Model = mongoose.model(model);
                var canDo = [];

                if(Model.fieldPermissions){
                    var fieldPermissions = Model.fieldPermissions();

                    for (var field in Model.schema.paths) {
                        if (field == '_id' || field == '__v'){
                            continue;
                        }

                        for(var permission in fieldPermissions[field]){
                            canDo.push(fieldPermissions[field][permission]);
                        }
                    };

                    permissions.push({
                        documentType: Model.modelName.toLowerCase(),
                        canDo: canDo
                    });

                    // console.log(Model.collection.name, 'fieldPermissions:', _permissions);
                    // console.log('permissions', permissions);
                }
            };
            console.log('grantAllFieldPermissions:', permissions);
            return permissions;
        },

        /*Grant all CRUD permissions*/
        grantAllBasePermissions: function(){
            var permissions = [];
            var types = ['', 'List', 'Unpublished'];

            for(var model in mongoose.models){
                var Model = mongoose.model(model);

                var canDo = []
                types.forEach(function(type){
                    var funcName = 'read' + type + 'Permission';
                    if(Model[funcName]){
                        var permissionName = Model[funcName]();
                        canDo.push(permissionName);
                    }
                });

                if(Model.createPermission){
                    canDo.push(Model.createPermission());
                }

                if(Model.updatePermission){
                    canDo.push(Model.updatePermission());
                }

                if(Model.deletePermission){
                    canDo.push(Model.deletePermission());
                }

                if(Model.publishPermission){
                    canDo.push(Model.publishPermission());
                }
                if(canDo.length > 0){
                    permissions.push({
                        documentType: Model.modelName.toLowerCase(),
                        canDo: canDo
                    });
                }

            };
            return permissions;
        },
    };
};
