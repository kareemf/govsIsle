'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController', ['$scope', 'Events', function ($scope, Events) {
    console.log('Google maps controller.');

    /* $scope.myMap auto-populated with google map object */
    $scope.isEditMode = true;


    $scope.mapOptions = {
        center: new google.maps.LatLng(40.6880492, -74.0188415),
        streetViewControl: true,
        panControl: true,
        zoom: 15,
        maxZoom: 20,
        minZoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.mapEvents = {
        'map-rightclick': 'addNewMarker($event, $params)',
    };

    $scope.markerEvents = {
        'map-click': 'openMarkerInfo(marker, events[$index])',
        'map-rightclick': 'editMarker(marker, events[$index])',
        'map-dragend': 'updateGeolocationAfterDrag(events[$index], marker)'
    };

    $scope.newMarkerEvents = {
        'map-click': 'openMarkerInfo(marker, event)',
        'map-rightclick': 'editMarker(marker, event)',
        'map-dragend': 'updateGeolocationAfterDrag(event, marker)'
    };

    $scope.addNewMarker = function ($event, $params) {
        console.log('rightclick', $event, $params);

        if(!$scope.isEditMode){
            console.log('not isEditMode');
            return;
        }

        // TODO: check user's permissions first
        var marker = new google.maps.Marker({
            map: $scope.myMap,
            position: $params[0].latLng,
            draggable: true
        });

        $scope.newMarkers.push(marker);
    };

    $scope.openMarkerInfo = function (marker, event) {
        console.log('openMarkerInfo marker', marker, 'event', event );

        $scope.currentMarker = marker;
        $scope.currentEvent = event;
        $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.editMarker = function(marker, event){
        console.log('editting marker', marker, 'event', event);

        $scope.$broadcast('MARKER_CAN_BE_EDITED_EVENT', {
            marker: marker,
            event: event
        });
    };

    //TODO: do not duplicate. see BaseEventController
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A];
    };

    $scope.updateGeolocationAfterDrag = function(event, marker){
        console.log('updating event position');

        var geoLocation = getMarkerGeoLocation(marker);
        event.geoLocation = geoLocation;
    };

  }]);

controllers.controller('MarkerListController', ['$scope', '$state','$stateParams','Events', 'Amenities','Shared', function($scope, $state, $stateParams, Events, Amenities, Shared){
    console.log('in MarkerListController');

    $scope.newMarkers = [];
    $scope.existingMarkers = [];
    $scope.filters = [];


    var createMarker = function(content, map){
        var position = new google.maps.LatLng(content.geoLocation[0], content.geoLocation[1]);
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            draggable: false
        });

        console.log('existing content', content, 'marker', marker);
        return marker;
    };

    // TODO: filters are case sensitive
    var getContentByFilters = function(filters){
        console.log('getContentByFilters', filters);
        $scope.existingMarkers = [];

        if(filters.indexOf('event') >= 0){
            Events.query(function(events){
                console.log('events', events);
                events.forEach(function(event){
                    $scope.existingMarkers.push(createMarker(event, $scope.myMap));
                });
            });

            //remove events from the set of filters to prevent including
            //amenities query
            filters = filters.filter(function(f){
                return f != 'event'
            });
        }

        if(filters.indexOf('tour') >= 0){
            //TODO: amenities with audio content
            filters = filters.filter(function(f){
                return f != 'tour'
            });
        }
        if(filters){
            Amenities.query({filter: filters}, function(amenities){
                console.log('amenities', amenities);
                amenities.forEach(function(activity){
                    $scope.existingMarkers.push(createMarker(activity, $scope.myMap));
                });
            });
        }


    };

    $scope.toggleFilter = function(oneOrMoreFilters){
        var scopeFilters = $scope.filters;
        var filters = [];

        if(angular.isArray(oneOrMoreFilters)){
            filters = oneOrMoreFilters
        }
        else{
            filters = [oneOrMoreFilters];
        }

        for (var i = filters.length - 1; i >= 0; i--) {
            var filter = filters[i];
            if(scopeFilters.indexOf(filter) >= 0){
                scopeFilters = scopeFilters.filter(function(f){
                    return f != filter
                });
            }
            else{
                scopeFilters.push(filter);
            }
        };

        $scope.filters = scopeFilters;
        console.log('scopeFilters', scopeFilters);
    };

    $scope.$watch('filters', function(newVal, oldVal){
        console.log('$scope.$watch filters triggered', newVal, oldVal);
        if(newVal == oldVal){
            return;
        }
        getContentByFilters($scope.filters);
    }, true);

    // $scope.toggleFilter(['info', 'food', 'drink', 'activity', 'venue', 'facility', 'tour', 'event']);




}]);
