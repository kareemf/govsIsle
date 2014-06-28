'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;

var PermissionSchema = new Schema({
    collectionName: String,
    documentId: ObjectId,
    canDo: [{
        type: String,
        unique: true,
        required: true
    }]
});

exports.schema = PermissionSchema;
