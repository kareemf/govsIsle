'use strict';

var _ = require('lodash');

module.exports = function(Model){
    var modelName = Model.modelName.toLowerCase();

    return {
        ascertainUserPermissions: function(user, doc){
            var canDo = [];
            // console.log('checking permissions');
            if(user.permissions){
                // console.log('user has permissions');
                user.permissions.forEach(function(permission){
                    // console.log('permission', permission);

                    if(!permission.documentType){
                        console.error('malformed permission: did not specify documentType:', permission);
                        return;
                    }
                    if(permission.documentType.toLowerCase() != modelName){
                        // console.log('permission documentType !=', modelName);
                        return;
                    }

                    var documentId = permission.documentId;
                    if(documentId){
                        if(!doc || !documentId.equals(doc.id)) {
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
        },

        ascertainBasicPermissions: function(doc){
            var canDo = [];
            if(doc.published){
                canDo.push('read');
            }
            return canDo;
        },

        ascertainPermissions: function(user, doc){
            var permissions = this.ascertainBasicPermissions(doc);
            if(user){
                permissions = _.uniq(permissions.concat(this.ascertainUserPermissions(user, doc)));
            }
            return permissions;
        },

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

        removeNonPermitedUpdateFields: function(permissions, doc, body, params){
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
        },

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
    };
};
