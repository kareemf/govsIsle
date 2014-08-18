'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseAlertMarkerController', ['$scope', '$controller', 'Alerts', function($scope, $controller, Alerts){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Alerts;
    $scope.baseUrl = 'api/v1/alerts/';

    var marker = $scope.marker;

    $scope.saveSuccessCallback = function(alert, headers){
        //save successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            alert: alert
        });
    };

    $scope.saveFailureCallback = function(response){
        console.log('failed to save alert', response);
        $scope.error = response.data;
    };

    $scope.updateSuccessCallback = function(alert, headers){
        //update successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            alert: alert
        });
    };

    $scope.updateFailureCallback = function(response){
        console.log('failed to update alert', response);
        $scope.error = response.data;
    };
}]);

controllers.controller('NewAlertMarkerController', ['$scope', '$controller', function($scope, $controller){
    console.log('in NewAlertMarkerController', $scope.marker);

    // 'inherit' from Base
    $controller('BaseAlertMarkerController', {$scope: $scope});

    var marker = $scope.marker;

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation;

    $scope.showForm = true;

    $scope.isPublished = alert.published ? true : false; //TODO: is this needed for new entites?

    $scope.alery = {
        geoLocation: getMarkerGeoLocation(marker)
    };


    $scope.cancel = function(alert, marker, markers){
        console.log('NewAlertMarkerController canceling marker', marker, 'alert', alert);

        marker.setMap(null);

        for (var i = markers.length - 1; i >= 0; i--) {
            if(markers[i].__gm_id == marker.__gm_id){
                markers.splice(i, 1);
                break;
            }
        };
    };

    $scope.$emit('NEW_ENTITY_EVENT', {
        entity: $scope.alert
    });
}]);

controllers.controller('ExistingAlertMarkerController', ['$scope', '$controller', 'Alerts', function($scope, $controller, Alerts){
    console.log('in ExistingAlertMarkerController. alert:', $scope.entity);

    $controller('BaseAlertMarkerController', {$scope: $scope});

    var alert = $scope.entity;

    $scope.showForm = false;

    $scope.isPublished = alert.published ? true : false;

    $scope.cancel = function(alert, marker){
        console.log('ExistingAlertMarkerController canceling marker', marker, 'alert', alert);

        //get the latest copy
        $scope.alert = Alerts.get({alertId: alert.id});
        $scope.showForm = false;
    };

    // if Alert/Marker is not being edited, don't allow user to drag
    $scope.$watch('showForm', function(newVal, oldVal){
        console.log('ExistingAlertMarkerController showForm changed', newVal, oldVal);

        if(newVal === oldVal){ return;}

        var marker = $scope.marker;
        var showForm = newVal;

        if(marker && !showForm){
            marker.setDraggable(false);
        }
    });

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in ExistingAlertMarkerController');

        /*
         user right-clicked an existing marker (handled by ExistingMarkerController)
         -> a 'MARKER_CAN_BE_EDITED_EVENT' event is dispatched.
         */

        if(args.entity.id != $scope.entity.id){
            return;
        }
        var marker = args.marker;
        marker.setDraggable(true);
        // TODO: check user's permissions first
        $scope.showForm = true;
        $scope.marker = marker;
        $scope.$apply();
    });
}]);

/**
 * NON-MAP CONTROLLERS
 **/
controllers.controller('AlertDetailController', ['$scope', '$stateParams', 'Alerts', function($scope, $stateParams, Alerts){
    console.log('in AlertDetailController');

    var slug = $stateParams.slug;

    if(slug){

        var successCallback = function(alert, headers){
            console.log('getBySlug alert', alert);

            $scope.alert = alert;
        };

        var failureCallback = function(response){
            console.log('getBySlug failed', response);

            $scope.error = response.data;
        };

        Alerts.getBySlug({slug: slug}, successCallback, failureCallback);

    }
}]);