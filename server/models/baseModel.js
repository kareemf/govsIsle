'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId;

exports.properties = {
    created: {type: Date, default: Date.now()},
    createdBy: {type: ObjectId, ref: 'User'},
    edited: { type: Date},
    editedBy: {type: ObjectId, ref: 'User'},
    beingEdited: {type: Boolean},
    beingEditedBy: {type: ObjectId, ref: 'User'}
};
