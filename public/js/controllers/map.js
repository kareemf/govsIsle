'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('MapController', ['$scope', 'Events', function($scope, Events){
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
                $scope.$broadcast('MARKER_ADDED_EVENT', {
                    marker: marker,
                    infoWindow: infoWindow
                });
            }
        }
    };

    $scope.isEditMode = false;

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in MapController');

        $scope.$broadcast('MARKER_CAN_BE_EDITED_EVENT'+'!', args);
    });
}]);
