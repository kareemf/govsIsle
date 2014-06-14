'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

var MARKER_ADDED_EVENT = 'MarkerAddedEvent';

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

    var infoWindow = new google.maps.InfoWindow();
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
                var clickLocation = args[0].latLng;

                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(clickLocation.k, clickLocation.A),
                    title: "New"
                });

                infoWindow.setContent('sdss');

                google.maps.event.addListener(marker, 'click', function() {
                    //there is only one infoWindow, which then gets moved around.
                    infoWindow.open(map, marker);
                });

                //inform other controllers of the markers creation
                $scope.$broadcast(MARKER_ADDED_EVENT, {
                    marker: marker
                });
            }
        }
    };
}]);

app.controller('EventController', ['$scope', 'Events', function($scope, Events){
    $scope.$on(MARKER_ADDED_EVENT, function(event, args){
        console.log('new marker added', args);
    });
}]);
