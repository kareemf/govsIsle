'use strict';

var _ = require('lodash'),
    base = require('./baseModel');

exports.properties = _.extend(base.properties, {
    published: {type: Date}
});
