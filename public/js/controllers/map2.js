'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController2', ['$scope', 'Events', function ($scope, Events) {
    console.log('Google maps controller.');

    /* $scope.myMap auto-populated with google map object */
    $scope.isEditMode = false;

    $scope.newMarkers = [];

    $scope.existingMarkers = [];

    // TODO: only grab relevant content
    // TODO: only one info window for whole app
    $scope.events = Events.query(function(events){
        console.log('events', events);
        events.forEach(function(event){
            var position = new google.maps.LatLng(event.geoLocation[0], event.geoLocation[1]);
            var marker = new google.maps.Marker({
                map: $scope.myMap,
                position: position,
                draggable: true
            });

            // console.log('existing event', event, 'marker', marker);
            $scope.existingMarkers.push(marker);
        });
    });

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
        'map-click': 'openMarkerInfo(marker)',
        'map-rightclick': 'editMarker(marker, events[$index])'
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

        // //inform other controllers of the markers creation
        // $scope.$broadcast('MARKER_ADDED_EVENT', {
        //     marker: marker,
        //     infoWindow: infoWindow
        // });
    };

    $scope.openMarkerInfo = function (marker) {
      $scope.currentMarker = marker;
      $scope.currentMarkerLat = marker.getPosition().lat();
      $scope.currentMarkerLng = marker.getPosition().lng();
      $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.editMarker = function(marker, event){
        console.log('editting marker', marker, 'event', event);
    };

    $scope.setMarkerPosition = function (marker, lat, lng) {
      marker.setPosition(new google.maps.LatLng(lat, lng));
    };
  }])
;
