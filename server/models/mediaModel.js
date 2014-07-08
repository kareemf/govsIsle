'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    base = require('./baseContentModel');

var properties = _.extend({
    name: String,
    attribution: String,
    caption: String,
    encoding: String,
    mimetype: String,
    extension: String,
    size: String,
    truncated: Boolean,
    file: Buffer
}, base.properties);

var MediaSchema = new Schema(properties);

mongoose.model('Media', MediaSchema);
