'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController', ['$scope', '$rootScope', 'Events', function ($scope, $rootScope, Events) {
    console.log('Google maps controller.');

    /* $scope.myMap auto-populated with google map object */
    $scope.isEditMode = true;
    $scope.isAdmin = false;

    console.log('$rootScope.user', $rootScope.user);
    var user = $rootScope.user;
    if(user){
        //TODO: use actual permissions
        if(user.roles){
            user.roles.forEach(function(role){
                if(role.name === 'admin'){
                    $scope.isAdmin = true;
                }
            });
        }
    }


    $scope.mapOptions = {
        center: new google.maps.LatLng(40.6880492, -74.0188415),
        streetViewControl: true,
        panControl: true,
        zoom: 15,
        maxZoom: 20,
        minZoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.mapEvents = {
        //TODO: temportarily disabled.
        'map-rightclick': 'addNewMarker($event, $params)',
    };

    $scope.newMarkers = [];

    $scope.newMarkerEvents = {
        'map-click': 'openMarkerInfo(marker, event)',
        'map-rightclick': 'editMarker(marker, event)',
        'map-dragend': 'updateGeolocationAfterDrag(event, marker)'
    };

    $scope.addNewMarker = function ($event, $params) {
        console.log('rightclick', $event, $params);

        if(!$scope.isEditMode){
            console.log('not isEditMode');
            return;
        }

        // TODO: check user's permissions first
        var marker = new google.maps.Marker({
            map: $scope.myMap,
            position: $params[0].latLng,
            draggable: true
        });

        $scope.newMarkers.push(marker);
    };

    $scope.openMarkerInfo = function (marker, event) {
        console.log('openMarkerInfo marker', marker, 'event', event );

        $scope.currentMarker = marker;
        $scope.currentEvent = event;
        $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.editMarker = function(marker, event){
        console.log('editting marker', marker, 'event', event);

        $scope.$broadcast('MARKER_CAN_BE_EDITED_EVENT', {
            marker: marker,
            event: event
        });
    };

    //TODO: do not duplicate. see BaseEventController
    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = function(marker){
        var position = marker.position;
        //8/6/14: Position.A seems to have been replaced with position.B
        return [position.k, position.A || position.B];
    };

    $scope.updateGeolocationAfterDrag = function(event, marker){
        console.log('updating event position');

        var geoLocation = getMarkerGeoLocation(marker);
        event.geoLocation = geoLocation;
    };

  }]);

controllers.controller('MarkerListController', ['$scope', '$state','$stateParams','Events', 'Amenities','Shared', function($scope, $state, $stateParams, Events, Amenities, Shared){
    console.log('in MarkerListController');

    $scope.events = [];
    $scope.existingEventMarkers = [];

    $scope.amenities = [];
    $scope.existingAmenityMarkers = [];

    $scope.markerEvents = {
        'map-click': 'openMarkerInfo(marker, entity)',
        'map-rightclick': 'editMarker(marker, entity)',
        'map-dragend': 'updateGeolocationAfterDrag(entity, marker)'
    };

    var createMarker = function(content, map){
        var position = new google.maps.LatLng(content.geoLocation[0], content.geoLocation[1]);
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            draggable: false
        });

        console.log('existing content', content, 'marker', marker);
        return marker;
    };

    var clearMarkers = function(markers){
        markers.forEach(function(marker){
            marker.setMap(null);
        });
    }

    // TODO: filters are case sensitive
    var getContentByFilters = function(filters){
        console.log('getContentByFilters', filters);
        clearMarkers($scope.existingEventMarkers);
        clearMarkers($scope.existingAmenityMarkers);
        $scope.existingEventMarkers = [];
        $scope.existingAmenityMarkers = [];

        if(filters.indexOf('event') >= 0){
            Events.query(function(events){
                console.log('events', events);
                events.forEach(function(event){
                    $scope.existingEventMarkers.push(createMarker(event, $scope.myMap));
                    $scope.events.push(event);
                });
            });

            //remove 'event' filter from the set of filters to prevent including
            //amenities query
            filters = filters.filter(function(f){
                return f != 'event'
            });
        }

        if(filters.indexOf('tour') >= 0){
            //TODO: amenities with audio content
            filters = filters.filter(function(f){
                return f != 'tour'
            });
        }
        if(filters && filters.length){
            Amenities.query({filter: filters}, function(amenities){
                console.log('amenities', amenities);
                amenities.forEach(function(activity){
                    $scope.existingAmenityMarkers.push(createMarker(activity, $scope.myMap));
                    $scope.amenities.push(activity);
                });
            });
        }
    };

    $scope.$watch(function(){return Shared.filters}, function(newVal, oldVal){
        //console.log('FILTERS_CHANGED', newVal, oldVal);
        if(!newVal){
            return getContentByFilters(Shared.allFilters);
        }
        getContentByFilters(newVal);
    }, true);
}]);

controllers.controller('GeoLocationController', ['$scope', 'Events', function ($scope, Events) {

    $scope.geo=function(){
        var coordinates= function(position){
            var lat= position.coords.latitude,
                lon= position.coords.longitude,
                accu= position.coords.accuracy; //return the accuracy in meters
            //alert(accu);
            var coords = lat+ ', '+ lon;
            document.getElementById('google_map').setAttribute('src',"https://maps.google.com?q="+coords+"&z=18&output=embed" )

        };

        var  err = function(error){
            //1 no premission, 2 no internet conncetion, 3 timeout
            if(error.code===1){alert('please allow us to access your location');}
            if(error.code===3){alert('The browser timeout')}
        };
        document.getElementById('get_location').onclick=function(){
            //enableHighAccuracy: true -> increase by 10 meters
            navigator.geolocation.getCurrentPosition(coordinates, err, 
                {enableHighAccuracy: true, 
                    maximumAge: 30000, //in millisecond to refresh the cach
                    //timeout: 300         //time in seconds for the browser to get the location
                });
            return false;
        }
    }();
}]);
