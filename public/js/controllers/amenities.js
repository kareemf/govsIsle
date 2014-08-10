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
controllers.controller('BaseEntityController', ['$scope', '$rootScope', function($scope, $rootScope){
    $scope.save = function(entity){
        console.log('saving Entity', entity);
        // TODO: validate

        $scope.Resource.save(entity, $scope.saveSuccessCallback, $scope.saveFailureCallback);
    };

    $scope.update = function(entity){
        console.log('updating Entity', entity);
        // TODO: validate

        $scope.Resource.update(entity, $scope.updateSuccessCallback, $scope.updateFailureCallback);
    };

    $scope.togglePublished = function(entity){
        if (entity.published) {
            entity.published = null;
            entity.publishedBy = null;
            $scope.isPublished = false;
        }
        else {
            entity.published = new Date();
            entity.pushedBy = $rootScope.user.id;
            $scope.isPublished = true;
        }
    }
}]);

controllers.controller('BaseAmenityMarkerController', ['$scope', '$controller', 'Amenities', function($scope, $controller, Amenities){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Amenities;

    var marker = $scope.marker

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

    $scope.updateSuccessCallback = function(amenity, headers){
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
}]);

controllers.controller('ExistingAmenityMarkerController', ['$scope', '$controller', 'Amenities', function($scope, $controller, Amenities){
    console.log('in ExistingAmenityController. amenity:', $scope.entity);

    var marker = $scope.marker;
    var amenity = $scope.entity;

    $controller('BaseAmenityMarkerController', {$scope: $scope});

    $scope.showForm = false;
    $scope.isPublished = amenity.published ? true : false;

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

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in ExistingAmenityMarkerController');

        /*
         user right-clicked an existing marker (handled by ExistingMarkerController)
         -> a 'MARKER_CAN_BE_EDITED_EVENT' entity is dispatched.
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

controllers.controller('NewAmenityMarkerController', ['$scope', '$controller', 'Amenities', 'Shared', function($scope, $controller, Amenities, Shared){
    console.log('inside NewAmenityMarkerController', $scope.marker);

    // TODO: hide form when amenity saved

    // 'inherit' from Base
    //$controller('BaseEntityController', {$scope: $scope});
    $controller('BaseAmenityMarkerController', {$scope: $scope});

    var marker = $scope.marker;
    var getMarkerGeoLocation = Shared.getMarkerGeoLocation;

    $scope.Resource = Amenities;

    $scope.showForm = true;

    $scope.isPublished = false;

    $scope.amenity = {
        name: '',
        type: '', // Activity, Exhibit, Tour, Program/Festival
        description: '',
        specialities: [],
        location: '',
        geoLocation: getMarkerGeoLocation(marker)
    };

    $scope.options = {
        lookupGeo: false,
        lookupLocation: false
    };

    $scope.cancel = function(amenity, marker, markers){
        console.log('NewAmenityMarkerController canceling marker', marker, 'amenity', amenity);

        marker.setMap(null);

        for (var i = markers.length - 1; i >= 0; i--) {
            if(markers[i].__gm_id == marker.__gm_id){
                markers.splice(i, 1);
                break;
            }
        }
    };

    $scope.$emit('NEW_ENTITY_EVENT', {
        entity: $scope.amenity
    });
}]);