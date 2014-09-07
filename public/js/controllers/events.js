'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseEventMarkerController', ['$scope', '$controller', 'Events', function($scope, $controller, Events){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Events;
    $scope.baseUrl = 'api/v1/events/';

    var marker = $scope.marker;

    $scope.saveSuccessCallback = function(event, headers){
        //save successful, close the form
        $scope.showForm = false;

        $scope.$emit('ENTITY_PERSISTED_EVENT', {
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

controllers.controller('ExistingEventMarkerController', ['$scope', '$controller', 'Events', function($scope, $controller, Events){
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
    Events.query(function(events){
        $scope.eventList = events;
        $scope.activities = events.filter(function(event){
            return event.type === 'activity';
        });
        $scope.venues = events.filter(function(event){
            return event.type === 'venue';
        });
        $scope.parkServices = events.filter(function(event){
            return event.type === 'tour';
        });
        $scope.specialEvent = events.filter(function(event){
            return event.type === 'event';
        });
        $scope.featured = events.filter(function(event){
            return event.isFeatured && event.isFeatured.indexOf('event') >=0;
        });


    });
    console.log("event array "+$scope.specialEvent);
}]);

controllers.controller('EventMapController', ['$scope','Events', function($scope,Events){
    console.log('In EventListController');
    var map;
    var mapMinZoom = 14;
    var mapMaxZoom = 19;
    var mapBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(40.682146, -74.027796),
      new google.maps.LatLng(40.695640, -74.009978));

    var mapGetTile = function(x,y,z) {
        return "templates/maps/"+z + "/" + x + "/" + y + ".png";
    }


    $scope.init = function() {
      var opts = {
        streetViewControl: false,
        center: new google.maps.LatLng(0,0),
        zoom: 14
      };
      map = new google.maps.Map(document.getElementById('eventmap'), opts);
      map.setMapTypeId(google.maps.MapTypeId.HYBRID);
      map.fitBounds(mapBounds);
      var maptiler = new klokantech.MapTilerMapType(map, mapGetTile, mapBounds, mapMinZoom, mapMaxZoom);
      var opacitycontrol = new klokantech.OpacityControl(map, maptiler);
    };

}]);
