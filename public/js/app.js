'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

var MARKER_ADDED_EVENT = 'MarkerAddedEvent';
var MARKER_UPDATED_EVENT = 'MarkerUpdatedEvent'

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

app.factory('Geocoder', [function(){
    var geocoder = new google.maps.Geocoder();
    var southWest = new google.maps.LatLng(40.68391889999999, -74.02667689999998);
    var northEast = new google.maps.LatLng(40.69379199999999, -74.01198210000001);
    var bounds = new google.maps.LatLngBounds(southWest, northEast);

    return {
        reverseLookup: function(geoLocation){
            var request = {
                location: new google.maps.LatLng(geoLocation[0], geoLocation[1]),
                bounds: bounds
            };

            geocoder.geocode(request, function(results, status) {
                console.log('geocoder results', results, 'status', status);
                // if (status == google.maps.GeocoderStatus.OK) {}
                return results;
            });
        }
    };
}]);

app.controller('MapController', ['$scope', 'Events', function($scope, Events){
    // TODO: only grab relevant content
    // TODO: only one info window for whole app
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
                    marker: marker,
                    infoWindow: infoWindow
                });
            }
        }
    };
}]);

app.controller('NewMarkerController', ['$scope', function($scope){
    $scope.markers = [];
    $scope.infoWindow = null;

    $scope.$on(MARKER_ADDED_EVENT, function(event, args){
        console.log('new marker added', args);

        var marker = args.marker;
        $scope.markers.push(marker);

        $scope.infoWindow = args.infoWindow;

        $scope.$apply();
    });

    $scope.$on(MARKER_UPDATED_EVENT, function(event, args){
        console.log('marker updated', args);
        var marker = args.marker;
        var event = args.event;
        var infoWindow = $scope.infoWindow;

        if(event.description){
            infoWindow.setContent(event.name + '<br/><hr/>' + event.description);
        }
    });

}]);

app.controller('NewEventController', ['$scope', 'Events', 'Geocoder', function($scope, Events, Geocoder){
    console.log('insdie NewEventController', $scope.marker);

    // TODO: hide form when event saved
    // TODO: add cancel button, also hides form
    // TODO: show form on marker right click
    // TODO: add 'edit' functionality
    // TODO: reverse geocode geoLocation
    // TODO: if geoLocation, prompt to update address
    // TODO: if address, prompt to update geoLocation
    // TODO: find more specific addresses

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

        $scope.$emit(MARKER_UPDATED_EVENT, {
            marker: marker,
            event: event
        });
    };

    //update event coords when marker is dragged
    google.maps.event.addListener(marker, 'dragend', function() {
        console.log('updating event position');
        var event = $scope.event;
        var geoLocation = getMarkerGeoLocation(marker);

        event.geoLocation = geoLocation
        event.location = Geocoder.reverseLookup(geoLocation);

        $scope.$apply();
    });
}]);
