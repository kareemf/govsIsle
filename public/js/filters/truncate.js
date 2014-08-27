'use strict';

var filters = angular.module('app.filter');

/*
 see http://stackoverflow.com/questions/18095727/limit-the-length-of-a-string-with-angularjs

 Usage:

 {{some_text | truncate:true:100:' ...'}}

 Options:

 wordwise (boolean) - if true, cut only by words bounds,
 max (integer) - max length of the text, cut to this number of chars,
 tail (string, default: ' …') - add this string to the input string if the string was cut.
 */
filters.filter('truncate', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});