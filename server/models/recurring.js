'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;

var RecurringSchema = new Schema({
    days: [String], //Mon-Sun
    months: [String], //Jan-Dec
    frequencies: [String], //1st - 4th
    excluding: [Date], //Holidays
    until: Date //Will not recur after
});

exports.schema = RecurringSchema;
