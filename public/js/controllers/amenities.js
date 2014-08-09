'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseAmenityController', ['$scope', '$rootScope', 'Amenities', function($scope, $rootScope, Amenities){
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A || position.B];
    };

    var saveSuccessCallback = function(newAmenity, headers){
        //save successful, close the form
        $scope.showForm = false;
    };

    var saveFailureCallback = function(response){
        console.log('failed to save amenity', response);
        $scope.error = response.data;
    };

    $scope.save = function(amenity, marker){
        console.log('saving Amenity');
        // TODO: validate

        Amenities.save(amenity, saveSuccessCallback, saveFailureCallback);

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            amenity: amenity
        });
    };

    var updateSuccessCallback = function(newAmenity, headers){
        //update successful, close the form
        $scope.showForm = false;
    };

    var updateFailureCallback = function(response){
        console.log('failed to update amenity', response);
        $scope.error = response.data;
    };

    $scope.update = function(amenity, marker){
        console.log('updating Amenity');
        // TODO: validate

        Amenities.update(amenity, updateSuccessCallback, updateFailureCallback);

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            amenity: amenity
        });
    };

    $scope.lookupGeo = function(amenity){
        Geocoder.lookup(amenity.location).then(function(response){
            console.log('got reverseLookup response', response);

            // TODO: if multiple results, allow user to pick
            if(response.results){
                var geoLocation = response.results[0].geometry.location;
                amenity.geoLocation = [geoLocation.k, geoLocation.A];
            }
        });
    };

    $scope.lookupLocation = function(amenity, marker){
        var geoLocation = getMarkerGeoLocation(marker);

        Geocoder.reverseLookup(geoLocation).then(function(response){
            console.log('got reverseLookup response', response);
            // TODO: if multiple results, allow user to pick
            if(response.results){
                amenity.location = response.results[0].formatted_address;
            }
        });
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

/**
 * To use:
 * $controller('BaseEntityController', {$scope: $scope});
 * $scope.Resource = {Angular Resource}
 * $scope.saveSuccessCallback = function(entity, headers)
 * $scope.saveFailureCallback = function(entity, headers)
 * $scope.updateSuccessCallback = function(entity, headers)
 * $scope.updateFailureCallback = function(entity, headers)
 */
controllers.controller('BaseEntityController', ['$scope', '$rootScope', 'Amenities', function($scope, $rootScope, Amenities){

    $scope.save = function(_entity){
        console.log('saving entity of type', $scope.Resource);
        // TODO: validate

        $scope.Resource.save(_entity, $scope.saveSuccessCallback, $scope.saveFailureCallback);
//        Amenities.save(_entity, $scope.saveSuccessCallback, $scope.saveFailureCallback);
    };

    $scope.update = function(_entity){
        console.log('updating entity of type', $scope.Resource);
        // TODO: validate

        $scope.Resource.update(_entity, $scope.updateSuccessCallback, $scope.updateFailureCallback);
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

controllers.controller('ExistingAmenityMarkerController', ['$scope', '$controller', 'Amenities', function($scope, $controller, Amenities){
    console.log('in ExistingAmenityController. amenity:', $scope.entity);

    var marker = $scope.marker;
    var amenity = $scope.entity;

    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Amenities;
    $scope.showForm = false;
    $scope.isPublished = amenity.published ? true : false;


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
    $controller('BaseAmenityController', {$scope: $scope});

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