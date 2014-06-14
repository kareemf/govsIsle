'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

app.factory('Events', ['$resource', function($resource){
    var eventUrl = 'api/v1/events/:eventId';
    return $resource(eventUrl, {
        eventId: '@id'
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

    $scope.map = {} //will be populated.

    $scope.mapParams = {
        options: {
            streetViewControl: true,
            panControl: true,
            maxZoom: 20,
            minZoom: 3
        },
        center: {
            latitude: 40.6880492,
            longitude: -74.0188415
        },
        zoom: 16,
        events: {
            rightclick: function(map, eventName, args){
                console.log('rightclick', map, eventName, args);
            }
        }
    };
}]);
