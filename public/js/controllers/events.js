'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseEventController', ['$scope', 'Events', 'Geocoder', function($scope, Events, Geocoder){
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position
        return [position.k, position.A];
    };

    var saveSuccessCallback = function(newEvent, headers){
        //save successful, close the form
        $scope.showForm = false;
    };

    var saveFailureCallback = function(response){
        console.log('failed to save event', response);
        $scope.error = response.data;
    };

    $scope.save = function(event, marker){
        console.log('saving Event');
        // TODO: validate

        Events.save(event, saveSuccessCallback, saveFailureCallback);

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            event: event
        });
    };

    var updateSuccessCallback = function(newEvent, headers){
        //update successful, close the form
        $scope.showForm = false;
    };

    var updateFailureCallback = function(response){
        console.log('failed to update event', response);
        $scope.error = response.data;
    };

    $scope.update = function(event, marker){
        console.log('updating Event');
        // TODO: validate

        Events.update(event, updateSuccessCallback, updateFailureCallback);

        $scope.$emit('MARKER_UPDATED_EVENT', {
            marker: marker,
            event: event
        });
    };

    $scope.lookupGeo = function(event){
        Geocoder.lookup(event.location).then(function(response){
            console.log('got reverseLookup response', response);

            // TODO: if multiple results, allow user to pick
            if(response.results){
                var geoLocation = response.results[0].geometry.location;
                event.geoLocation = [geoLocation.k, geoLocation.A];
            }
        });
    };

    $scope.lookupLocation = function(event, marker){
        var geoLocation = getMarkerGeoLocation(marker);

        Geocoder.reverseLookup(geoLocation).then(function(response){
            console.log('got reverseLookup response', response);
            // TODO: if multiple results, allow user to pick
            if(response.results){
                event.location = response.results[0].formatted_address;
            }
        });
    };
}]);

controllers.controller('NewEventController', ['$scope', '$controller', 'Events', 'Geocoder', function($scope, $controller, Events, Geocoder){
    console.log('insdie NewEventController', $scope.marker);

    // TODO: hide form when event saved

    // 'inherit' from Base
    $controller('BaseEventController', {$scope: $scope});

    var marker = $scope.marker;

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation

    $scope.event = {
        name: '',
        type: '', // Activity, Exhibit, Tour, Program/Festival
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

    $scope.cancel = function(event, marker, markers){
        console.log('NewEventController canceling marker', marker, 'event', event);

        marker.setMap(null);

        for (var i = markers.length - 1; i >= 0; i--) {
            if(markers[i].__gm_id == marker.__gm_id){
                markers.splice(i, 1);
                break;
            }
        };
    };

}]);

controllers.controller('ExistingEventController', ['$scope', '$controller', 'Events', 'Geocoder', function($scope, $controller, Events, Geocoder){
    console.log('in ExistingEventController');

    $controller('BaseEventController', {$scope: $scope});

    $scope.showForm = false;

    $scope.cancel = function(event, marker){
        console.log('ExistingEventController canceling marker', marker, 'event', event);

        //get the latest copy
        $scope.event = Events.get({eventId: event.id});
        $scope.showForm = false;
    };

    // if Event/Marker is not being edited, don't allow user to drag
    $scope.$watch('showForm', function(newVal, oldVal){
        console.log('ExistingEventController showForm changed', newVal, oldVal);

        if(newVal === oldVal){ return;}

        var marker = $scope.marker;
        var showForm = newVal;

        if(marker && !showForm){
            marker.setDraggable(false);
        }
    });

    // register drag event handler (marker may not be draggable yet)
    // $scope.$watch('marker', function(newVal, oldVal){
    //     console.log('ExistingEventController marker changed', newVal, oldVal);

    //     if(newVal === oldVal){ return;}

    //     var marker = $scope.marker;
    //     var event = $scope.event;

    //     $scope.addMarkerDragListener($scope, event, marker);
    // });

    $scope.$on('MARKER_CAN_BE_EDITED_EVENT', function(event, args){
        console.log('responding to MARKER_CAN_BE_EDITED_EVENT in BaseEventController');

        /*
         user right-clicked an existing marker (handled by ExistingMarkerController)
         -> a 'MARKER_CAN_BE_EDITED_EVENT' event is dispatched.
         */

        if(args.event.id != $scope.event.id){
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



