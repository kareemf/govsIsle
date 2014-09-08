'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseAmenityMarkerController', ['$scope', '$controller', 'Amenities', function($scope, $controller, Amenities){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Amenities;
    $scope.baseUrl = 'api/v1/amenities/';

    var marker = $scope.marker;

    $scope.saveSuccessCallback = function(amenity, headers){
        //save successful, close the form
        $scope.showForm = false;

        $scope.$emit('ENTITY_PERSISTED_EVENT', {
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

/**
 * NON-MAP CONTROLLERS
 **/
controllers.controller('AmenityDetailController', ['$scope', '$stateParams', 'Amenities', 'SiteData', function($scope, $stateParams, Amenities, SiteData){
    //TODO: duplicate of EntityDetailController. Abstract out commonalities
    console.log('in AmenityDetailController');

    var slug = $stateParams.slug;

    if(slug){
        console.log("In AmenityDetailController slug found "+slug);

        var successCallback = function(amenity, headers){
            console.log('getBySlug amenity', amenity);

            $scope.amenity = amenity;
        };

        var failureCallback = function(response){
            console.log('getBySlug failed', response);

            $scope.error = response.data;
        };

        Amenities.getBySlug({slug: slug}, successCallback, failureCallback);

    }
}]);