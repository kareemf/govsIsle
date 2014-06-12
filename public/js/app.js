'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

app.controller('MapController', ['$scope', function($scope){
    $scope.mapOptions = {
        center: {
            latitude: 40.6880492,
            longitude: -74.0188415
        },
        zoom: 16
    };
}])
