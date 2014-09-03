'use strict';
var services = angular.module('app.services');

services.factory('Weather', ['$resource', function($resource){
    var weatherUrl = 'api/v1/weather';
    return $resource(weatherUrl);
}]);
