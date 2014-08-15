'use strict';

var controllers = angular.module('app.controllers', []);
var services = angular.module('app.services', []);
var filter = angular.module('app.filter', []);

var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'app.filter',
    'ngResource',
    'angularFileUpload',
    'ui.router',
    'ui.map']);

app.config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    //Lading page routes
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'templates/landing.html'
        });

    //Home routes
    $stateProvider
        .state('home', {
            url: '/home?view',
            templateUrl: 'templates/home/home.html'
        })
        .state('home.map', {
            templateUrl: 'templates/home/map.html'
        })
        .state('home.list', {
            templateUrl: 'templates/home/list.html'
        });

    // Auth routes
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/auth/login.html'
        })
        .state('logout', {
            url: '/logout',
            templateUrl: 'templates/auth/logout.html',
            controller: 'LogoutController'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/auth/register.html'
        });

    // Info routes
    $stateProvider
        .state('about', {
            url: '/about',
            templateUrl: 'templates/info/about.html'
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'templates/info/contact.html'
        })
        .state('history', {
            url: '/history',
            templateUrl: 'templates/info/history.html'
        })
        .state('faqs', {
            url: '/faqs',
            templateUrl: 'templates/info/faqs.html'
        })
        .state('ferry', {
            url: '/ferry',
            templateUrl: 'templates/info/ferry.html'
        })

    // Event routes
    $stateProvider
        .state('events', {
            url: '/events?view',
            templateUrl: 'templates/events/events.html'
        })
        .state('events.map',{
            url: '/map',
            //templateUrl: 'templates/map/maplist.html'
            templateUrl: 'templates/events/eventmap.html'
        })
        .state('events.list',{
            url: '/list',
            templateUrl: 'templates/events/eventlist.html'
        })
        .state('events.grid',{
            url: '/grid',
            templateUrl: 'templates/events/eventgrid.html'
        })
        .state('events.events',{
            url: '/events',
            templateUrl: 'templates/events/events.html'
        })
        .state('events.detail', {
            url: '/{slug}',
            templateUrl: 'templates/events/event.html'
        });

    // Amenity routes
    $stateProvider
        .state('amenityDetail',{
            url: '/amenities/{slug}',
            templateUrl: 'templates/amenities/amenity.html',
        });
		
	$stateProvider
	        .state('tours', {
	            url: '/tours',
	            templateUrl: 'templates/tours/tours.html'
	        });
	
	$stateProvider
			.state('tourlist',{
			    url: '/tourlist/{id}',
			    templateUrl: 'templates/tours/tour.html'
			});	
					
	$stateProvider
			.state('tourpoint', {
				url: '/tourpoint/{id}',
				templateUrl: 'templates/tours/tourpoint.html'
			});	
	
	
    $urlRouterProvider.otherwise('/');
		
	$sceDelegateProvider.resourceUrlWhitelist([
				   'self',
				   'http://www.entangledspace.com/**']);

}])

services.factory('Alerts', ['$resource', function($resource){
    var alertUrl = 'api/v1/alerts/:alertId';
    return $resource(alertUrl, {
        alertId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: alertUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);

'use strict';

var services = angular.module('app.services');

services.factory('Amenities', ['$resource', function($resource){
    var amenityUrl = 'api/v1/amenities/:amenityId';
    return $resource(amenityUrl, {
        amenityId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: amenityUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);

'use strict';

var services = angular.module('app.services');

services.factory('Events', ['$resource', function($resource){
    var eventUrl = 'api/v1/events/:eventId';
    return $resource(eventUrl, {
        eventId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: eventUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);

'use strict';

var services = angular.module('app.services');

services.factory('Geocoder', ['$q', function($q){
    // TODO: find more specific addresses

    var geocoder = new google.maps.Geocoder();
    var southWest = new google.maps.LatLng(40.68391889999999, -74.02667689999998);
    var northEast = new google.maps.LatLng(40.69379199999999, -74.01198210000001);
    var bounds = new google.maps.LatLngBounds(southWest, northEast);
    var request = {
        bounds: bounds
    }

    var exec = function(request, deferred){
        geocoder.geocode(request, function(results, status) {
            console.log('geocoder results', results, 'status', status);
            // if (status == google.maps.GeocoderStatus.OK) {}
            deferred.resolve({
                results: results,
                status: status
            });
        });
    };

    return {
        lookup: function(location){
            // attempt to geocode location
            var deferred = $q.defer();
            request.address = location;

            exec(request, deferred);

            return deferred.promise;
        },
        reverseLookup: function(geoLocation){
            // extract location from geocode
            var deferred = $q.defer();
            request.location = new google.maps.LatLng(geoLocation[0], geoLocation[1]);

            exec(request, deferred);

            return deferred.promise;
        }
    };
}]);

'use strict';

var services = angular.module('app.services');

services.factory('Menus', ['$resource', function($resource) {
    return $resource('admin/menu/:name', {
        name: '@name',
        defaultMenu: '@defaultMenu'
    });
}]);


//Global service for global variables
services.factory('Global', [

    function() {
        var _this = this;
        _this._data = {
            user: window.user,
            authenticated: false,
            isAdmin: false
        };
        if (window.user && window.user.roles) {
            _this._data.authenticated = window.user.roles.length;
            _this._data.isAdmin = ~window.user.roles.indexOf('admin');
        }
        return _this._data;
    }
]);

'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {
        getMarkerGeoLocation: function(marker){
            //8/6/14: Position.A seems to have been replaced with position.B
            var position = marker.position
            return [position.k, position.A || position.B];
        }
    };
	return self.data;
}]);

services.factory('NavService',function($rootScope){
    var activelink=null, hideInfo=null;
    return {
        updateBtn : function(newval) {
            activelink=newval;
            $rootScope.$broadcast('XChanged', activelink);
        },
        getBtn :function(){
            return activelink;
        },
        getHiddenBtn : function(){
            if(activelink===2 || activelink===3 || activelink===4 || activelink===6){
                return true;
            }
            else{return false;}
        }
   };
})

services.factory('SiteData', function($rootScope){
    //second carousel on main page
    //testing
    var subEvents= [
        {'id':1,
         'name': 'Discover',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 2,
         'link': 'events.grid',
         'media': "dist/images/landing/Thumb_discover_320x250.jpg"
        },
        {'id':2,
         'name': 'Eat',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home',
         'media': "dist/images/landing/Thumb_eat_320x250.jpg"
        },
        {'id':3,
         'name': 'Enjoy',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home',
         'media': "dist/images/landing/Thumb_enjoy_320x250.jpg"
        },
        {'id':4,
         'name': 'Learn',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 4,
         'link': 'tours',
         'media': "dist/images/landing/Thumb_learn_320x250.jpg"
        }
    ];
    return {
        updateSiteData : function(newval) {
            $rootScope.$broadcast('YChanged', activelink);
        },
        getEvents :function(){return events;},
        getSubEvents :function(){return subEvents;},

   };
})





'use strict';
var filters = angular.module('app.filter');

filters.filter('trustedHtml', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

filters.filter('SelecteByType', ['SiteData', function(SiteData){
    return function(type) {

    	var temp = SiteData.getEvents(),
    				typeArray= [];

    	for( var i=0; i<temp.length; i+=1){
    		if(temp[i].type===type){
    			typeArray.push(temp[i]);
    		}
    	}
        return typeArray;
    };
}]);
//going to improve for now. ill repeat code 
filters.filter('subSelectByType', ['SiteData', function(SiteData){
    return function(type) {

        var temp = SiteData.getSubEvents(),
                    typeArray= [];

        for( var i=0; i<temp.length; i+=1){
            if(temp[i].type===type){
                typeArray.push(temp[i]);
            }
        }
        return typeArray;
    };
}]);

filters.filter('SelecteByFeatured', ['SiteData', function(SiteData){
    return function(typeOfFeature) {

    	var temp = SiteData.getEvents(),
    				theArray= [];
    	
    	for( var i=0; i<temp.length; i+=1){
    		if(temp[i].isFeautred.indexOf(typeOfFeature) >=0){
    			theArray.push(temp[i]);
    		}
    	}
        return theArray;
    };
}]);

filters.filter('allData', ['SiteData', function(SiteData){
        return SiteData.getEvents();
}]);
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
'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('LoginController', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        // This object will be filled by the form
        $scope.user = {};

        // Register the login() function
        $scope.login = function(user) {
            console.log('attempting login for user', user);

            $http.post('/login', {
                email: user.email,
                password: user.password
            })
            .success(function(response) {
                // authentication OK
                console.log('login success. response', response);

                $scope.loginError = '';
                $scope.isLoggedIn = true;

                $rootScope.user = response.user;
                $rootScope.$emit('loggedin');

                if (response.redirect) {
                    if (window.location.href === response.redirect) {
                        //This is so an admin user will get full admin page
                        window.location.reload();
                    } else {
                        window.location = response.redirect;
                    }
                } else {
                    $location.url('/');
                }
            })
            .error(function() {
                console.log('login failure');

                $scope.loginError = 'Authentication failed.';
            });
        };
    }
]);

controllers.controller('LogoutController', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        $http.get('logout')
        .success(function(response){
            console.log('logout success');
            $rootScope.user = null;
            $location.url('/');
        })
        .error(function(){
            console.error('failed to logout');
        })
    }
]);


controllers.controller('RegisterController', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        $scope.user = {};

        $scope.register = function(user) {
            $scope.usernameError = null;
            $scope.registerError = null;

            $http.post('/register', {
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword,
                username: user.username,
                name: user.name
            })
            .success(function() {
                // authentication OK
                $scope.registerError = 0;
                $rootScope.user = $scope.user;
                $rootScope.$emit('loggedin');
                $location.url('/');
            })
            .error(function(error) {
                // Error: authentication failed
                if (error === 'Username already taken') {
                    $scope.usernameError = error;
                } else {
                    $scope.registerError = error;
                }
            });
        };
    }
]);

/**
 * To use:
 * $controller('BaseEntityController', {$scope: $scope});
 * $scope.Resource = {Angular Resource}
 * $scope.saveSuccessCallback = function(entity, headers)
 * $scope.saveFailureCallback = function(entity, headers)
 * $scope.updateSuccessCallback = function(entity, headers)
 * $scope.updateFailureCallback = function(entity, headers)
 */
controllers.controller('BaseEntityController', ['$scope', '$rootScope', '$upload', function($scope, $rootScope, $upload){
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
    };

    $scope.coverPhotoUpload = function($files) {
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: $scope.baseUrl + $scope.entity.id,
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
}]);
'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('BaseEventMarkerController', ['$scope', '$controller', 'Events', function($scope, $controller, Events){
    $controller('BaseEntityController', {$scope: $scope});

    $scope.Resource = Events;
    $scope.baseUrl = 'api/v1/events/';

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

    // $scope.featured=$filter('SelecteByFeatured')('event');

    // $scope.specialEvent=$filter('SelecteByType')('event');
    // $scope.parkServices=$filter('SelecteByType')('tour');
    // $scope.venues=$filter('SelecteByType')('venue');
    // $scope.activities=$filter('SelecteByType')('activity');
    // $scope.eventList=$filter('allData');

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

'use strict';

angular.module('app.controllers').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus','NavService',
    function($scope, $rootScope, Global, Menus, NavService) {
        $scope.global = Global;
        $scope.menus = {};
        //service now in control of updating foo
        /*
        $scope.$watch(
            function(){return NavService.navHeader}, function(newVal, oldVal){
            console.log('NavService.navHeader', newVal, oldVal);
            $scope.headerview = NavService.navHeader;
        });
        */

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function(menu) {
                $scope.menus[name] = menu;
            });
        }

        // Query server for menus and check permissions
        queryMenu('main', defaultMainMenu);

        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function() {
            //queryMenu('main', defaultMainMenu);
            $scope.global = {
                authenticated: !! $rootScope.user,
                user: $rootScope.user
            };
        });
    }
]);

controllers.controller('NavController', ['$scope','$location', '$filter','NavService', 'Shared', 'Events', function($scope, $location, $filter, NavService, Shared, Events){
    console.log('In NavController');
    var path = $location.path();

    var paths=["/","/about","/events/grid","/events/map","/tours","/ferry", "/events/list"];

    $scope.currentLink=paths.indexOf(path);
    console.log($scope.currentLink+"link");

    $scope.activelink = function(numbtn) {
        NavService.updateBtn(numbtn);
    };
    $scope.isActive=function(checkTab){
        return NavService.getBtn()===checkTab;
    };
    $scope.buttonswap= function(){
        return NavService.getHiddenBtn();
    };
    $scope.$on('XChanged', function(event, x) {
       $scope.currentLink = x;
    });

    //For the landing page area
    //$scope.featured=$filter('SelecteByFeatured')('main');
    //TODO: only query fo featured Events
    Events.query(function(events){
        $scope.featured = events.filter(function(event){
            return event.isFeatured && event.isFeatured.indexOf('main') >=0;
        });
    });
    $scope.subEvents=$filter('subSelectByType')('active');
    console.log("testing= "+ $scope.subEvents);
    /* need to be fix niquepg
    console.log("the featured= "+ $scope.featured);
    $scope.initLanding=function(tmp){
        return (tmp===0);
    };
    */
    var allFilters = Shared.allFilters = ['info', 'food', 'drink', 'activity', 'venue', 'facility', 'tour', 'event'];
    $scope.filters = allFilters;

    $scope.toggleFilters = function(oneOrMoreFilters){
        //console.log('toggleFilter!');
        var scopeFilters = $scope.filters;
        var filters = oneOrMoreFilters.split(", ");

        if(filters.indexOf('all') >= 0){
            if(scopeFilters.length){
                //turn all filters off
                scopeFilters = [];
            }
            else{
                //turn all filters on
                scopeFilters = allFilters;
            }
        }
        else{
            for (var i = filters.length - 1; i >= 0; i--) {
                var filter = filters[i];
                if(scopeFilters.indexOf(filter) >= 0){
                    scopeFilters = scopeFilters.filter(function(f){
                        return f != filter
                    });
                }
                else{
                    scopeFilters.push(filter);
                }
            };
        }

        $scope.filters = scopeFilters;
       // console.log('scopeFilters', scopeFilters);

        Shared.filters = scopeFilters;
    };

    $scope.isFilterActive = function(filter){
        var filters = $scope.filters;
        for(var i = filters.length - 1; i > 0; i--){
            if(filters[i] === filter){
                return true;
            }
        }
        return false;
    }
}]);

'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('HomeController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
    // console.log('In HomeController. $stateParams.view', $stateParams.view);

    var view = $stateParams.view;
    view = view ? view : 'map';

    // console.log('changeing to home state:', view);
    $state.go('home.' + view);


}]);
/*
EVENTS MODELS
var properties = _.extend({
    name: String,
    type: String, // Activity, Exhibit, Tour, Program/Festival
    description: String,
    visibility: String, //Private/Public
    setupDateTime: Date,
    startDateTime: Date,
    endDateTime: Date,
    cleanupDateTime: Date,
    isReccuring: Boolean,
    anticipatedAttendance: Number,
    location: String,
    geoLocation: {type: [Number], index: '2d'},
    media: [{type: ObjectId, ref: 'Media'}]
}, base.properties);

*/
controllers.controller('LandingController', ['$scope','$location', 'NavService',function($scope, $location, NavService){
    console.log('In LandingController');

}]);
'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('AppController', ['$rootScope', '$http', function($rootScope, $http){
    var checkLoggedIn = function(){
        $http.get('/loggedin')
            .success(function(response) {
                console.log('loggedin check success. response', response);
                if(angular.isObject(response) && response._id){
                    console.log('logged in user', response);

                    $rootScope.user = response;
                }
            })
            .error(function() {
                console.log('loggedin check failure');
            });
    };

    checkLoggedIn();
}]);
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

    var spiderfiedColor = 'ffee22';
    var usualColor = 'eebb22';
    var gm = google.maps;
    var shadow = new gm.MarkerImage(
        'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
        new gm.Size(37, 34),  // size   - for sprite clipping
        new gm.Point(0, 0),   // origin - ditto
        new gm.Point(10, 34)  // anchor - where to meet map location
    );

    $scope.$watch('myMap', function(map){
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
                markers[i].setShadow(shadow);
            }
        });
    });

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

                if(!entity.published){
                    icon = 'http://maps.google.com/mapfiles/ms/icons/blue.png';
                }
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

        console.log('existing entity', entity, 'marker', marker);
        return marker;
    };

    var clearMarkers = function(markers){
        markers.forEach(function(marker){
            marker.setMap(null);
        });
    };

    var updateMarkerIcon = function(entity, marker, markers){
        for(var i = markers.length - 1; i >= 0; i--){
            if(markers[i] == marker){
                var icon = determineMarkerIcon(entity);
                marker.setIcon(icon);
    }
        }
    };

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
                    var marker = createMarker(event, $scope.myMap)

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
            //TODO: amenities with audio content
            filters = filters.filter(function(f){
                return f != 'tour'
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
        }
    };

    $scope.$watch(function(){return Shared.filters}, function(newVal, oldVal){
        //console.log('FILTERS_CHANGED', newVal, oldVal);
        if(!newVal){
            return getContentByFilters(Shared.allFilters);
        }
        getContentByFilters(newVal);
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

'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('ToursController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    	console.log('in TourController');
		
		$scope.getImageSrc = function (imageFile) {
		  return 'http://www.entangledspace.com/staging/' + imageFile;
		};

	    $http.get('http://entangledspace.com/staging/getTours.php?username=cultureisland&bl_lat=40.5&bl_lng=-74.1&tr_lat=40.7&tr_lng=-74.0').
	           success(function(data) {
	               $scope.allTours = data;
				   
				$scope.allTourpoints = [];   
	   			var log = [];
	   			angular.forEach($scope.allTours, function(value) {
					
	   	   	    	$http.get('http://entangledspace.com/staging/getTourpoints.php?username=cultureisland&tourID='+value.id+'').
	   	   	           success(function(data_2) {	
	
	   	   	               var log2 = [];
						   angular.forEach(data_2, function(point) {
							   $scope.allTourpoints.push(point);
							   //alert(point);
						   }, log2);
					   
	   	   	    	   });

	   			}, log);
				//alert($scope.allTourpoints);
				
				   
	    });
		
	    $http.get('http://entangledspace.com/staging/getTours.php?username=cultureisland').
	           success(function(data) {
	               $scope.myTours = data;
				   
				$scope.myTourpoints = [];   
	   			var log = [];
	   			angular.forEach($scope.myTours, function(value) {
					
	   	   	    	$http.get('http://entangledspace.com/staging/getTourpoints.php?username=cultureisland&tourID='+value.id+'').
	   	   	           success(function(data_2) {	
	
	   	   	               var log2 = [];
						   angular.forEach(data_2, function(point) {
							   $scope.myTourpoints.push(point);
							   //alert(point);
						   }, log2);
					   
	   	   	    	   });

	   			}, log);
				//alert($scope.allTourpoints);
				
				   
	    });
		
}]);


controllers.controller('TourpointDetailController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    console.log('in TourpointDetailController');
	
	$scope.getAudioSrc = function (audioFile) {
	  return 'http://www.entangledspace.com/staging/' + audioFile;
	};
	
	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/staging/' + imageFile;
	};
	
   $scope.playing = false;
   $scope.audio = document.getElementById('audioPlayer');
	
   $scope.play = function() {
	    $scope.audio.play();
	    $scope.playing = true;
   };
   
   $scope.stop = function() {
	    $scope.audio.pause();
	    $scope.playing = false;
   };
   
   $scope.audio.addEventListener('ended', function() {
	    $scope.$apply(function() {
	      $scope.stop()
	    });
   });

   var id = $stateParams.id;
   if(id){

	    $http.get('http://entangledspace.com/staging/getPost.php?username=cultureisland&postID='+id).
	           success(function(data) {
	               $scope.tourpoint = data;
		   		   $scope.audio.src = $scope.getAudioSrc($scope.tourpoint.clipLoc);
	    });
		
		
		
    }
}]);

controllers.controller('TourListController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    console.log('in TourListController');
	

	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/staging/' + imageFile;
	};
	
    var id = $stateParams.id;
    if(id){
		
	    $http.get('http://entangledspace.com/staging/getTour.php?username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tour = data;
	    });

	    $http.get('http://entangledspace.com/staging/getTourpoints.php?username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tourpoints = data;
	    });
		
    }
	
}]);