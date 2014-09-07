'use strict';

function initCall() {
  console.log('Google maps api initialized.');
  angular.bootstrap(document.getElementById('map'), ['app']);
}

var controllers = angular.module('app.controllers');

controllers.controller('MapController', ['$scope', '$rootScope', 'Shared', function ($scope, $rootScope, Shared) {
    console.log('Google maps controller.');

    var strictBounds = new google.maps.LatLngBounds(
     new google.maps.LatLng(28.70, -127.50), 
     new google.maps.LatLng(48.85, -55.90)
    );
    
    var mapStyles=[{
        featureType: 'all',
        elementType: 'labels',
        stylers:[
            {visibility: 'off'}
        ]
    },{
        featureType: 'water',
        elementType:'geometry',
        stylers:[
            {color: '#2F516A'}
        ]
    },{
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
        {color:'#4B5557'}
        ]
    },{
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
        {color:'#4B5557'}
        ]
    },{
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
        {color:'#2F516A'}
        ]     
    },{
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
        {color:'#2F516A'}
        ]     
    }];

    var gm = google.maps;
    var markerShadow = new gm.MarkerImage(
        'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
        new gm.Size(37, 34),  // size   - for sprite clipping
        new gm.Point(0, 0),   // origin - ditto
        new gm.Point(10, 34)  // anchor - where to meet map location
    );

    var getMarkerGeoLocation = $scope.getMarkerGeoLocation = Shared.getMarkerGeoLocation;

    /* $scope.myMap auto-populated with google map object */
    $scope.isEditMode = true;
    $scope.isAdmin = false

    //TODO: use permissions to determine what content user can create if any
    $scope.contentTypes = ['event', 'amenity', 'alert'];
    $scope.newMarkers = [];

    $scope.mapOptions = {
        center: new google.maps.LatLng(40.6880492, -74.0188415),
        streetViewControl: false,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        disableDefaultUI: true,
        zoom: 17,
        maxZoom: 18,
        minZoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControlOptions:{ 
            position: google.maps.ControlPosition.RIGHT_TOP,
            style: google.maps.ZoomControlStyle.small
        },
        styles:mapStyles
    };
   
    $scope.mapEvents = {
        'map-rightclick': 'addNewMarker($event, $params)'
    };

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

    $scope.$watch('myMap', function(map){
        if(!map){return;}
        $scope.mapInit();

        var oms = $scope.oms = new OverlappingMarkerSpiderfier(map);

        oms.addListener('click', function(marker) {
            $scope.openMarkerInfo(marker, marker.entity);
        });

        oms.addListener('spiderfy', function(markers) {
            for(var i = 0; i < markers.length; i ++) {
                markers[i].setShadow(null);
            }
            $scope.myInfoWindow.close();
        });

        oms.addListener('unspiderfy', function(markers) {
            for(var i = 0; i < markers.length; i ++) {
                markers[i].setShadow(markerShadow);
            }
        });
    });
     
    $scope.mapInit = function() {
        var options = $scope.mapOptions;
        var map = $scope.myMap;
        var mapBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(40.682146, -74.027796),
          new google.maps.LatLng(40.695640, -74.009978)
        );

        // var maptiler = new klokantech.MapTilerMapType(map, mapGetTile, mapBounds, options.minZoom, options.maxZoom);
        var googleMapsOverlay = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) { 
                var proj = map.getProjection();
                var z2 = Math.pow(2, zoom);
                var tileXSize = 256 / z2;
                var tileYSize = 256 / z2;
                var tileBounds = new google.maps.LatLngBounds(
                    proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
                    proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
                );
                var y = coord.y;
                if (mapBounds.intersects(tileBounds) && (options.minZoom <= zoom) && (zoom <= options.maxZoom)){
                    return "templates/maps/"+zoom + "/" + coord.x + "/" + y + ".png";
                }
                else{
                    return "templates/maps/blink.png";
                }
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            opacity: 1.0,
            name: "GovsIsle"
        });

        map.fitBounds(mapBounds);
        map.setTilt(0); //disable 45 degree view
        map.overlayMapTypes.insertAt(0, googleMapsOverlay);
    };
    $scope.openMarkerInfo = function (marker, entity) {
        console.log('openMarkerInfo marker', marker, 'entity', entity );

        $scope.currentMarker = marker;

        //TODO: swtich on entyity.type or rename currentEvent
        $scope.currentEvent = entity;
        $scope.myInfoWindow.open($scope.myMap, marker);
    };

    $scope.addNewMarker = function ($event, $params) {
        console.log('rightclick', $event, $params);

        if(!$scope.isEditMode){
            console.log('not isEditMode');
            return;
        }

        if(!$scope.isAdmin){
            console.log('not isAdmin');
            return;
        }

        // TODO: check user's permissions first
        var marker = new google.maps.Marker({
            map: $scope.myMap,
            position: $params[0].latLng,
            draggable: true
        });
        $scope.oms.addMarker(marker);
        $scope.newMarkers.push(marker);
    };

    $scope.editMarker = function(marker, entity){
        console.log('editting marker', marker, 'entity', entity);

        if(!$scope.isAdmin){
            console.log('not isAdmin');
            return;
        }

        $scope.$broadcast('MARKER_CAN_BE_EDITED_EVENT', {
            marker: marker,
            entity: entity
        });
    };

    $scope.cancelMarker = function(marker, markers){
        markers = markers.filter(function(_marker){
            return marker !== _marker
        });
        marker.setMap(null);
    };

    $scope.updateGeolocationAfterDrag = function(marker, entity){
        console.log('updating entity position. entity', entity, 'marker', marker);

        var geoLocation = getMarkerGeoLocation(marker);
        if(entity){
            entity.geoLocation = geoLocation;
        }

    };

    $scope.userLocation = function(){
        var map = $scope.myMap;

        var coordinates = function(position){
            var lat = position.coords.latitude,
                lon = position.coords.longitude,
                accu = position.coords.accuracy; //return the accuracy in meters
            //alert(accu);
            var coords = lat+ ', '+ lon;
            //document.getElementById('google_map').setAttribute('src',"https://maps.google.com?q="+coords+"&z=18&output=embed" )
                 
            var newmarker = new google.maps.Marker({
                map: map,
                position: {lat:40.689462, lng:-74.016792},
                draggable: false,
                icon:'http://res.cloudinary.com/hqsaer6gs/image/upload/c_scale,h_51/v1410040466/locationMarker_lfmaem.png'
            });
            $scope.oms.addMarker(newmarker);
            return [lat, lon];

        };

        var err = function(error){
            //1 no premission, 2 no internet conncetion, 3 timeout
            if(error.code===1){
                console.log('please allow us to access your location');
            }
            if(error.code===3){
                console.log('The browser timeout');
            }
        };

        document.getElementById('geolocation').onclick=function(){
            navigator.geolocation.getCurrentPosition(coordinates, err,
                {enableHighAccuracy: true,   //enableHighAccuracy: true -> increase by 10 meters
                    maximumAge: 30000,      //in millisecond to refresh the cache
                    //timeout: 300         //time in seconds for the browser to get the location
                });
            return false;
        }
    };
}]);

controllers.controller('MarkerListController', ['$scope', '$state','$stateParams','Events', 'Amenities', 'Alerts',
    'Tours', 'Shared', function($scope, $state, $stateParams, Events, Amenities, Alerts, Tours, Shared){
    console.log('in MarkerListController');

    $scope.events = [];
    $scope.existingEventMarkers = [];

    $scope.amenities = [];
    $scope.existingAmenityMarkers = [];
	
    $scope.tourPoints = [];
    $scope.tourMarkers = [];

    $scope.alerts = [];
    $scope.existingAlertMarkers = [];

    $scope.markerEvents = {
        //'map-click': 'openMarkerInfo(marker, entity)',
        'map-rightclick': 'editMarker(marker, entity)',
        'map-dragend': 'updateGeolocationAfterDrag(marker, entity)'
    };

    var determineMarkerIcon = function(entity){
        var icon;

        //using marker dot to distinguish between published and unpublished entity
        switch(entity.type){
            default:
            case 'event':
                icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/red.png';
                }
                break;
            case 'food':
            case 'drink':
                icon = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/pink.png';
                }
                break;
            case 'info':
                icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/green.png';
                }
                break;
            case 'activity':
                icon = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/orange.png';
                }
                break;
            case 'facility':
                icon = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/lightblue.png';
                }
                break;
            case 'tour':
                icon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

                break;
            case 'venue':
                icon = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/purple.png';
                }
                break;
        }
        return icon;
    };

    var createMarker = function(entity, map){
        var position = new google.maps.LatLng(entity.geoLocation[0], entity.geoLocation[1]);

        var markerOptions = {
            map: map,
            position: position,
            draggable: false
        };

        var icon = determineMarkerIcon(entity);

        if(icon) {
            markerOptions.icon = icon;
        }

        var marker = new google.maps.Marker(markerOptions);
        marker.entity = entity;

        //console.log('existing entity', entity, 'marker', marker);
        return marker;
    };
	
    var createTourMarker = function(tourpoint, map){
		
		tourpoint.name = tourpoint.postName;
		tourpoint.description = tourpoint.postText;
		tourpoint.type = 'tour';
		//tourpoint.geoLocation[0] = tourpoint.latitude;
		//tourpoint.geoLocation[1] = tourpoint.longitude;
		
		
        var position = new google.maps.LatLng(tourpoint.latitude, tourpoint.longitude);

        var markerOptions = {
            map: map,
            position: position,
            draggable: false
        };

        var icon = determineMarkerIcon(tourpoint);

        if(icon) {
            markerOptions.icon = icon;
        }

        var marker = new google.maps.Marker(markerOptions);
		//console.log(tourpoint.description);
		marker.entity = tourpoint; 

        //console.log('existing entity', tourpoint, 'marker', marker);
        return marker;
    };
	
    var clearMarkers = function(markers){
        markers.forEach(function(marker){
            marker.setMap(null);
        });
        markers = [];
    };

    var updateMarkerIcon = function(entity, marker, markers){
        for(var i = markers.length - 1; i >= 0; i--){
            if(markers[i] == marker){
                var icon = determineMarkerIcon(entity);
                marker.setIcon(icon);
                break;
            }
        }
    };

    // TODO: filters are case sensitive
    var getContentByFilters = function(filters){
        console.log('getContentByFilters', filters);
        clearMarkers($scope.existingEventMarkers);
        clearMarkers($scope.existingAmenityMarkers);
        clearMarkers($scope.tourMarkers);

        //TODO: events become activitites
        if(filters.indexOf('event') >= 0){
            Events.query(function(events){
                console.log('events', events);
                events.forEach(function(event){
                    var marker = createMarker(event, $scope.myMap);

                    $scope.oms.addMarker(marker);
                    $scope.existingEventMarkers.push(marker);
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
            			
            var _tourpoints = [];
			Tours.getTourpoints(function(data){
			   for(var i in data['tour_points']) {
				    //console.log(data['tour_points'] [i]);
			       	//_tourpoints.push(data['tour_points'] [i]);
					//console.log(data['tour_points'] [i]);
	                var marker = createTourMarker(data['tour_points'] [i], $scope.myMap);

	                $scope.oms.addMarker(marker);
					$scope.tourMarkers.push(marker);
	                $scope.tourPoints.push(data['tour_points'] [i]);
			   }

			});
        }
		
        if(filters && filters.length){
            Amenities.query({filter: filters}, function(amenities){
                console.log('amenities', amenities);
                amenities.forEach(function(amenity){
                    var marker = createMarker(amenity, $scope.myMap);

                    $scope.oms.addMarker(marker);
                    $scope.existingAmenityMarkers.push(marker);
                    $scope.amenities.push(amenity);
                });
            });

            //if(filters.indexOf('alert') >= 0){
                //Alerts.query({}, function(alerts){
                    //console.log('alerts', alerts);
                    //alerts.forEach(function(alert){
                    //    var marker = createMarker(alert, $scope.myMap);

                    //    $scope.oms.addMarker(marker);
                    //    $scope.existingAlertMarkers.push(marker);
                    //    $scope.alerts.push(alert);
                    //});
                //});
            //}
        }
    };

    $scope.$watch(function(){return Shared.filters}, function(newVal, oldVal){
        //console.log('FILTERS_CHANGED', newVal, oldVal);
        if(newVal && !oldVal){
            //special case - ignores
            return;
        }
        if(!newVal){
            Shared.filters = Shared.allFilters;
            return getContentByFilters(Shared.filters);
        }
        getContentByFilters(newVal);
    }, true);

    $scope.$watch(function(){return Shared.alerts || Shared.filters}, function(){
        var alerts = Shared.alerts;
        var filters = Shared.filters;

        console.log('NEW ALERTS', alerts, 'NEW FILTERS', filters);

        if(!alerts || !filters || filters.indexOf('alert') < 0){
            return;
        }

        clearMarkers($scope.existingAlertMarkers);
        alerts.forEach(function(alert){
            var marker = createMarker(alert, $scope.myMap);

            $scope.oms.addMarker(marker);
            $scope.existingAlertMarkers.push(marker);
            $scope.alerts.push(alert);
        });
    }, true);

    $scope.$on('MARKER_UPDATED_EVENT', function(event, args){
        if(args.event){
            updateMarkerIcon(args.event, args.marker, $scope.existingEventMarkers);
        }
        else if(args.amenity){
            updateMarkerIcon(args.amenity, args.marker, $scope.existingAmenityMarkers);
        }
    });
}]);

controllers.controller('NewMarkerListController', ['$scope', '$controller', function($scope, $controller){
    console.log('in NewMarkerListController');

    $scope.newMarkerEvents = {
        //'map-click': 'openMarkerInfo(marker, findRelatedEntity(marker))',
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