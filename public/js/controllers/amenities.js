'use strict';

var controllers = angular.module('app.controllers');

/**
 * To use:
 * $controller('BaseEntityController', {$scope: $scope});
 * $scope.Resource = {Angular Resource}
 * $scope.saveSuccessCallback = function(entity, headers)
 * $scope.saveFailureCallback = function(entity, headers)
 * $scope.updateSuccessCallback = function(entity, headers)
 * $scope.updateFailureCallback = function(entity, headers)
 */
controllers.controller('BaseEntityController', ['$scope', function($scope){
    //TODO: move
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A || position.B];
    };

    $scope.save = function(_entity){
        console.log('saving entity of type', $scope.Resource);
        // TODO: validate

        $scope.Resource.save(_entity, $scope.saveSuccessCallback, $scope.saveFailureCallback);
    };

    $scope.update = function(_entity){
        console.log('updating entity of type', $scope.Resource);
        // TODO: validate

        $scope.Resource.update(_entity, $scope.updateSuccessCallback, $scope.updateFailureCallback);
    };
}]);

controllers.controller('ExistingAmenityMarkerController', ['$scope', '$controller', 'Amenities', function($scope, $controller, Amenities){
    console.log('in ExistingAmenityController. amenity:', $scope.amenity);

    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Amenities;
    $scope.showForm = false;

    $scope.saveSuccessCallback = function(amenity, headers){
        //save successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            amenity: amenity
        });
    };

    $scope.saveFailureCallback = function(response){
        console.log('failed to save amenity', response);
        $scope.error = response.data;
    };

    $scope.updateSuccessCallback = function(newAmenity, headers){
        //update successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            amenity: amenity
        });
    };

    $scope.updateFailureCallback = function(response){
        console.log('failed to update amenity', response);
        $scope.error = response.data;
    };

    $scope.cancel = function(amenity, marker){
        console.log('ExistingAmenityController canceling marker', marker, 'amenity', amenity);

        //get the latest copy
        $scope.amenity = Amenities.get({amenityId: amenity.id});
        $scope.showForm = false;
    };

    // if Amenity/Marker is not being edited, don't allow user to drag
    $scope.$watch('showForm', function(newVal, oldVal){
        console.log('ExistingAmenityMarkerController showForm changed', newVal, oldVal);

        if(newVal === oldVal){ return;}

        var marker = $scope.marker;
        var showForm = newVal;

        if(marker && !showForm){
            marker.setDraggable(false);
        }
    });

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(amenity, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in ExistingAmenityMarkerController');

        /*
         user right-clicked an existing marker (handled by ExistingMarkerController)
         -> a 'MARKER_CAN_BE_EDITED_EVENT' amenity is dispatched.
         */

        if(args.amenity.id != $scope.amenity.id){
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