'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    permissionSchema = require('./permissionModel').schema;

var RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    permissions: [permissionSchema]
});

mongoose.model('Role', RoleSchema);
