'use strict';

var app = angular.module('app', ['ngResource', 'google-maps']);

var MARKER_ADDED_EVENT = 'MARKER_ADDED_EVENT';
var MARKER_UPDATED_EVENT = 'MARKER_UPDATED_EVENT';
var MARKER_DELETED_EVENT = 'MARKER_DELETED_EVENT';
var MARKER_CAN_BE_EDITED_EVENT = 'MARKER_CAN_BE_EDITED_EVENT';

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

app.factory('Geocoder', ['$q', function($q){
    var geocoder = new google.maps.Geocoder();
    var southWest = new google.maps.LatLng(40.68391889999999, -74.02667689999998);
    var northEast = new google.maps.LatLng(40.69379199999999, -74.01198210000001);
    var bounds = new google.maps.LatLngBounds(southWest, northEast);
    var request = {
        bounds: bounds
    }

    var exec = function(request, deferred){
        geocoder.geocode(request, function(results, status) {
            console.log('geocoder results', results, 'status', status);
            // if (status == google.maps.GeocoderStatus.OK) {}
            deferred.resolve({
                results: results,
                status: status
            });
        });
    };

    return {
        lookup: function(location){
            // attempt to geocode location
            var deferred = $q.defer();
            request.address = location;

            exec(request, deferred);

            return deferred.promise;
        },
        reverseLookup: function(geoLocation){
            // extract location from geocode
            var deferred = $q.defer();
            request.location = new google.maps.LatLng(geoLocation[0], geoLocation[1]);

            exec(request, deferred);

            return deferred.promise;
        }
    };
}]);

app.controller('MapController', ['$scope', 'Events', function($scope, Events){
    // TODO: only grab relevant content
    // TODO: only one info window for whole app
    $scope.events = Events.query(function(events){
        console.log('events', events);
    });

    //will be automatically populated b/c of 'controls' property on map DOM element
    $scope.map = {};

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

                if(!$scope.isEditMode){
                    console.log('not isEditMode');
                    return;
                }

                // TODO: check user's permissions first
                var clickLocation = args[0].latLng;

                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(clickLocation.k, clickLocation.A),
                    draggable: true
                });

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

    $scope.isEditMode = false;

    $scope.$on(MARKER_CAN_BE_EDITED_EVENT, function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in MapController');

        $scope.$broadcast(MARKER_CAN_BE_EDITED_EVENT+'!', args);
    });
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

    $scope.$on(MARKER_DELETED_EVENT, function(event, args){
        console.log('marker deleted', args);

        var event = args.event;
        var marker = args.marker;
        var markers = $scope.markers;

        for (var i = markers.length - 1; i >= 0; i--) {
            if(markers[i].__gm_id == marker.__gm_id){
                markers.splice(i, 1);
                break;
            }
        };

    });
}]);

app.controller('ExistingMarkerController', ['$scope', function($scope){
    console.log('in ExistingMarkerController');

    $scope.markerParams = {
        events: {
            rightclick: function(map, eventName, args){
                console.log('rightclick on existing marker', map, eventName, args);

                var event = $scope.event;
                var marker = args.gMarker;
                // inform other controllers that this marker may be edited
                $scope.$emit(MARKER_CAN_BE_EDITED_EVENT, {
                    marker: marker,
                    event: event
                });
            }
        }
    };
}]);

app.controller('BaseEventController', ['$scope', 'Events', 'Geocoder', function($scope, Events, Geocoder){
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A];
    };

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

    $scope.lookupGeo = function(event){
        Geocoder.lookup(event.location).then(function(response){
            console.log('got reverseLookup response', response);

            // TODO: if multiple results, allow user to pick
            if(response.results){
                var geoLocation = response.results[0].geometry.location;
                event.geoLocation = [geoLocation.k, geoLocation.A];
            }
        });
    };

    $scope.lookupLocation = function(event, marker){
        var geoLocation = getMarkerGeoLocation(marker);

        Geocoder.reverseLookup(geoLocation).then(function(response){
            console.log('got reverseLookup response', response);
            // TODO: if multiple results, allow user to pick
            if(response.results){
                event.location = response.results[0].formatted_address;
            }
        });
    };
}]);

app.controller('NewEventController', ['$scope', '$controller', 'Events', 'Geocoder', function($scope, $controller, Events, Geocoder){
    console.log('insdie NewEventController', $scope.marker);

    // TODO: hide form when event saved
    // TODO: show edit form on marker right click
    // TODO: add 'edit' functionality
    // TODO: find more specific addresses

    // 'inherit' from Base
    $controller('BaseEventController', {$scope: $scope});

    var marker = $scope.marker;

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation

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

    $scope.options = {
        lookupGeo: false,
        lookupLocation: false
    };

    $scope.showForm = true;

    $scope.cancel = function(event, marker){
        console.log('canceling marker', marker, 'event', event);

        marker.setMap(null);

        $scope.$emit(MARKER_DELETED_EVENT, {
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

        $scope.$apply();
    });
}]);

app.controller('ExistingEventController', ['$scope', '$controller', 'Events', 'Geocoder', function($scope, $controller, Events, Geocoder){
    console.log('in ExistingEventController');

    $controller('BaseEventController', {$scope: $scope});

    $scope.showForm = false;

    $scope.cancel = function(event, marker){
        console.log('ExistingEventController canceling marker', marker, 'event', event);

        //get the latest copy
        $scope.event = Events.get({eventId: event.id});
        $scope.showForm = false;

    };

    $scope.$on(MARKER_CAN_BE_EDITED_EVENT+'!', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in BaseEventController');

        /*
         user right-clicked an existing marker (handled by ExistingMarkerController)
         -> a MARKER_CAN_BE_EDITED_EVENT event is dispatched.
         we want ExistingEventController to handle this event, however, the
         scopes do not don't have a parent/child relationship. So the event is bubbled
         up to the MapController, which is a parent of both controllers,
         then broadcasted back down to ExistingEventController. '!' is added
         to prevent MapController from responding to the event which it is broadcasting
         */

        if(args.event != $scope.event){
            return;
        }
        // TODO: check user's permissions first
        $scope.showForm = true;
        $scope.marker = args.marker;
    });

}]);

