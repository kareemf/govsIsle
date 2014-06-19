'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('NewMarkerController', ['$scope', function($scope){
    $scope.markers = [];
    $scope.infoWindow = null;

    $scope.$on('MARKER_ADDED_EVENT', function(event, args){
        console.log('new marker added', args);

        var marker = args.marker;
        $scope.markers.push(marker);

        $scope.infoWindow = args.infoWindow;

        $scope.$apply();
    });

    $scope.$on('MARKER_UPDATED_EVENT', function(event, args){
        console.log('marker updated', args);
        var marker = args.marker;
        var event = args.event;
        var infoWindow = $scope.infoWindow;

        if(event.description){
            infoWindow.setContent(event.name + '<br/><hr/>' + event.description);
        }
    });

    $scope.$on('MARKER_DELETED_EVENT', function(event, args){
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

controllers.controller('ExistingMarkerController', ['$scope', function($scope){
    console.log('in ExistingMarkerController');

    $scope.markerParams = {
        events: {
            rightclick: function(map, eventName, args){
                console.log('rightclick on existing marker', map, eventName, args);

                var event = $scope.event;
                var marker = args.gMarker;
                // inform other controllers that this marker may be edited
                $scope.$emit('MARKER_CAN_BE_EDITED_EVENT', {
                    marker: marker,
                    event: event
                });
            }
        }
    };
}]);
