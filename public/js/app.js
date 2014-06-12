'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

app.factory('Events', ['$resource', function($resource){
    var eventUrl = 'api/v1/events/:eventId';
    return $resource(eventUrl, {
        eventId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

app.controller('MapController', ['$scope', 'Events', function($scope, Events){
    $scope.events = Events.query(function(events){
        console.log('events', events);
    });

    $scope.mapOptions = {
        center: {
            latitude: 40.6880492,
            longitude: -74.0188415
        },
        zoom: 16
    };
}]);
