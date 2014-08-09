'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController', ['$scope', '$rootScope', 'Shared', function ($scope, $rootScope, Shared) {
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

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = Shared.getMarkerGeoLocation;

    $scope.mapOptions = {
        center: new google.maps.LatLng(40.6880492, -74.0188415),
        streetViewControl: true,
        panControl: true,
        zoom: 16,
        maxZoom: 20,
        minZoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.mapEvents = {
        'map-rightclick': 'addNewMarker($event, $params)'
    };

    //TODO: use permissions to determine what content user can create if any
    $scope.contentTypes = ['event', 'amenity'];

    $scope.openMarkerInfo = function (marker, entity) {
        console.log('openMarkerInfo marker', marker, 'entity', entity );

        $scope.currentMarker = marker;

        //TODO: swtich on entyity.type or rename currentEvent
        $scope.currentEvent = entity;
        $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.newMarkers = [];

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

    $scope.editMarker = function(marker, entity){
        console.log('editting marker', marker, 'entity', entity);

        $scope.$broadcast('MARKER_CAN_BE_EDITED_EVENT', {
            marker: marker,
            entity: entity
        });
    };

    $scope.updateGeolocationAfterDrag = function(marker, entity){
        console.log('updating entity position. entiy', entity, 'marker', marker);

        var geoLocation = getMarkerGeoLocation(marker);
        if(entity){
            entity.geoLocation = geoLocation;
        }

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
        'map-dragend': 'updateGeolocationAfterDrag(marker, entity)'
    };

    var createMarker = function(content, map){
        var position = new google.maps.LatLng(content.geoLocation[0], content.geoLocation[1]);
        var icon;

        //using marker dot to distinguish between published and unpublished content
        switch(content.type){
            default:
            case 'event':
                icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/red.png';
                }
                break;
            case 'food':
            case 'drink':
                icon = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/pink.png';
                }
                break;
            case 'info':
                icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/green.png';
                }
                break;
            case 'activity':
                icon = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/orange.png';
                }
                break;
            case 'facility':
                icon = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/lightblue.png';
                }
                break;
            case 'tour':
                icon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/blue.png';
                }
                break;
            case 'venue':
                icon = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';

                if(!content.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/purple.png';
                }
                break;
        }

        var markerOptions = {
            map: map,
            position: position,
            draggable: false
        };

        if(icon) {
            markerOptions.icon = icon;
        }

        var marker = new google.maps.Marker(markerOptions);

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

controllers.controller('NewMarkerListController', ['$scope', '$controller', function($scope, $controller){
    console.log('in NewMarkerListController');

    $scope.newMarkerEvents = {
        'map-click': 'openMarkerInfo(marker, findRelatedEntity(marker))',
        'map-rightclick': 'editMarker(marker, findRelatedEntity(marker))',
        'map-dragend': 'updateGeolocationAfterDrag(marker, findRelatedEntity(marker))'
    };

    $scope.newEntities = [];

    $scope.$on('NEW_ENTITY_EVENT', function(event, args){
        console.log('responding to NEW_ENTITY_EVENT. args', args);
        $scope.newEntities.push(args.entity);
    });

     $scope.findRelatedEntity = function(marker){
        var markers = $scope.newMarkers;
        var entities = $scope.newEntities;

        for(var i = markers.length - 1; i >= 0; i--){
            if(markers[i] == marker){
                return entities[i];
            }
        }
        return null;
    };

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
