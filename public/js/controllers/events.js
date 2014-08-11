'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseEventMarkerController', ['$scope', '$controller', 'Events', function($scope, $controller, Events){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Events;

    var marker = $scope.marker

    $scope.saveSuccessCallback = function(event, headers){
        //save successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            event: event
        });
    };

    $scope.saveFailureCallback = function(response){
        console.log('failed to save event', response);
        $scope.error = response.data;
    };

    $scope.updateSuccessCallback = function(event, headers){
        //update successful, close the form
        $scope.showForm = false;

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            event: event
        });
    };

    $scope.updateFailureCallback = function(response){
        console.log('failed to update event', response);
        $scope.error = response.data;
    };
}]);

controllers.controller('NewEventMarkerController', ['$scope', '$controller', function($scope, $controller){
    console.log('in NewEventMarkerController', $scope.marker);

    // TODO: hide form when event saved

    // 'inherit' from Base
    $controller('BaseEventMarkerController', {$scope: $scope});

    var marker = $scope.marker;

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation;

    $scope.event = {
        name: '',
        type: 'event', // Activity, Exhibit, Tour, Program/Festival
        description: '',
        visibility: '', //Private/Public
        setupDateTime: null,
        startDateTime: null,
        endDateTime: null,
        cleanupDateTime: null,
        isReccuring: false,
        anticipatedAttendance: null,
        location: '',
        geoLocation: getMarkerGeoLocation(marker)
    };

    $scope.options = {
        lookupGeo: false,
        lookupLocation: false
    };

    $scope.showForm = true;

    $scope.isPublished = event.published ? true : false;


    $scope.cancel = function(event, marker, markers){
        console.log('NewEventMarkerController canceling marker', marker, 'event', event);

        marker.setMap(null);

        for (var i = markers.length - 1; i >= 0; i--) {
            if(markers[i].__gm_id == marker.__gm_id){
                markers.splice(i, 1);
                break;
            }
        };
    };

    $scope.$emit('NEW_ENTITY_EVENT', {
        entity: $scope.event
    });

}]);

controllers.controller('ExistingEventMarkerController', ['$scope', '$controller', '$upload', 'Events', function($scope, $controller, $upload, Events){
    console.log('in ExistingEventMarkerController. event:', $scope.entity);

    $controller('BaseEventMarkerController', {$scope: $scope});

    var event = $scope.entity;

    $scope.showForm = false;

    $scope.isPublished = event.published ? true : false;

    $scope.cancel = function(event, marker){
        console.log('ExistingEventMarkerController canceling marker', marker, 'event', event);

        //get the latest copy
        $scope.event = Events.get({eventId: event.id});
        $scope.showForm = false;
    };

    $scope.onFileSelect = function($files) {
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: 'api/v1/events/' + event.id,
                method: 'PUT',
                file: file, // or list of files ($files) for html5 only
                fileFormDataName: 'coverPhoto', //or a list of names for multiple files (html5). Default is 'file'
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                console.log('file upload success', data, status, headers, config);
            }).error(function(){
                console.log('file upload faile.');
            });

        }
    };

    // if Event/Marker is not being edited, don't allow user to drag
    $scope.$watch('showForm', function(newVal, oldVal){
        console.log('ExistingEventMarkerController showForm changed', newVal, oldVal);

        if(newVal === oldVal){ return;}

        var marker = $scope.marker;
        var showForm = newVal;

        if(marker && !showForm){
            marker.setDraggable(false);
        }
    });

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in ExistingEventMarkerController');

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
controllers.controller('EventDetailController', ['$scope', '$stateParams', 'Events', 'SiteData', function($scope, $stateParams, Events, SiteData){
    console.log('in EventDetailController');

    //$scope.events=SiteData.getEvents();         //getting all events
    var slug = $stateParams.slug;

    if(slug){
        console.log("In EventDetailController slug found "+slug);

        var successCallback = function(event, headers){
            console.log('getBySlug event', event);

            $scope.event = event;
        };

        var failureCallback = function(response){
            console.log('getBySlug failed', response);

            $scope.error = response.data;
        };

        Events.getBySlug({slug: slug}, successCallback, failureCallback);

    }
}]);

controllers.controller('EventListController', ['$scope', '$state','$stateParams','Events','$filter', function($scope, $state, $stateParams, Events, $filter){
    console.log('In EventListController');
    
    $scope.featuredEvents=$filter('SelecteByFeatured')('event');

    $scope.specialEvent=$filter('SelecteByType')('event');
    $scope.parkServices=$filter('SelecteByType')('tour');
    $scope.venues=$filter('SelecteByType')('venue');
    $scope.activities=$filter('SelecteByType')('activity');
    $scope.landing=$filter('SelecteByType')('main');
}]);

controllers.controller('EventMapController', ['$scope', '$state','$stateParams','Events', function($scope, $state, $stateParams, Events){
    console.log('In EventListController');
    //var view = $stateParams.view;
    //view = view ? view : 'map';
    var map;
    var mapMinZoom = 15;
    var mapMaxZoom = 17;
    var mapBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.682183, -74.027019),
        new google.maps.LatLng(40.695688, -74.008764));
    var mapGetTile = function(x,y,z) {
        return "templates/map/"+z + "/" + x + "/" + y + ".png";
    }

    var mapOptions = {
        center: new google.maps.LatLng(40.682183, -74.027019),
        streetViewControl: false,
        panControl: true,
        zoom: 15,
        maxZoom: mapMaxZoom,
        minZoom: mapMinZoom,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };

    $scope.init = function() {

        map = new google.maps.Map(document.getElementById('eventmap'), mapOptions);
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        map.fitBounds(mapBounds);
        var maptiler = new klokantech.MapTilerMapType(map, mapGetTile, mapBounds, mapMinZoom, mapMaxZoom);
        var opacitycontrol = new klokantech.OpacityControl(map, maptiler);
    };
}]);
