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
    // TODO: only grab relevant content
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

                // TODO: check user's permissions first
                var clickLocation = args[0].latLng;

                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(clickLocation.k, clickLocation.A),
                    draggable: true
                });

                // infoWindow.setContent('sdss');

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

app.controller('NewMarkerController', ['$scope', function($scope){
    $scope.markers = [];

    $scope.$on(MARKER_ADDED_EVENT, function(event, args){
        console.log('new marker added', args);

        var marker = args.marker;
        $scope.markers.push(marker);
        $scope.$apply();
    });
}]);

app.controller('NewEventController', ['$scope', 'Events', function($scope, Events){
    console.log('insdie NewEventController', $scope.marker);

    // TODO: hide form when event saved
    // TODO: add cancel button, also hides form
    // TODO: show form on marker right click
    // TODO: add 'edit' functionality

    var marker = $scope.marker;

    var getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A];
    };

    $scope.event = {
        name: '',
        type: '', // Activity, Exhibit, Tour, Program/Festival
        description: '',
        visibility: '', //Private/Public
        setupDateTime: null,
        startDateTime: null,
        endDateTime: null,
        cleanupDateTime: null,
        isReccuring: false,
        anticipatedAttendance: null,
        location: '',
        geoLocation: getMarkerGeoLocation(marker)
    };

    $scope.showForm = true;

    $scope.save = function(event, marker){
        console.log('saving Event');
        // TODO: validate

        var successCallback = function(newEvent, headers){
            //save successful, close the form
            $scope.showForm = false;
        };

        var failureCallback = function(response){
            console.log('failed to save event', response);
            $scope.error = response.data;
        };

        Events.save(event, successCallback, failureCallback);
    };

    //update event coords when marker is dragged
    google.maps.event.addListener(marker, 'dragend', function() {
        console.log('updating event position');
        $scope.event.geoLocation = getMarkerGeoLocation(marker);
        $scope.$apply();
    });
}]);
