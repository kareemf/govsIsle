'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;

var PermissionSchema = new Schema({
    collection: String,
    document: ObjectId,
    can: [{
        type: String,
        unique: true,
        required: true
    }]
});

exports.schema = PermissionSchema;
