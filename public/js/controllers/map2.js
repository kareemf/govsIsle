'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController2', ['$scope', 'Events', function ($scope, Events) {
    console.log('Google maps controller.');

    // TODO: only grab relevant content
    // TODO: only one info window for whole app
    $scope.events = Events.query(function(events){
        console.log('events', events);
    });

    $scope.isEditMode = false;


    $scope.myMarkers = [];

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
        'map-rightclick': function(map, eventName, args){
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
            $scope.$broadcast('MARKER_ADDED_EVENT', {
                marker: marker,
                infoWindow: infoWindow
            });
        },
        'map-click': 'addMarker($event, $params)',
        'map-zoom_changed': 'setZoomMessage(myMap.getZoom())'
    };

    $scope.addMarker = function ($event, $params) {
      $scope.myMarkers.push(new google.maps.Marker({
        map: $scope.myMap,
        position: $params[0].latLng
      }));
    };

    $scope.setZoomMessage = function (zoom) {
      $scope.zoomMessage = 'You just zoomed to ' + zoom + '!';
      console.log(zoom, 'zoomed');
    };

    $scope.openMarkerInfo = function (marker) {
      $scope.currentMarker = marker;
      $scope.currentMarkerLat = marker.getPosition().lat();
      $scope.currentMarkerLng = marker.getPosition().lng();
      $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.setMarkerPosition = function (marker, lat, lng) {
      marker.setPosition(new google.maps.LatLng(lat, lng));
    };
  }])
;
