'use strict';

var controllers = angular.module('app.controllers', []);
var services = angular.module('app.services', []);
var filter = angular.module('app.filter', []);
var directives = angular.module('app.directives', []);


var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'app.filter',
    'app.directives.addToCalendar',
    'ngResource',
    'ngCookies',
    'ngDragDrop',
    'ngQuickDate',
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

    //Map routes
    $stateProvider
        .state('map', {
            url: '/map?filters',
            templateUrl: 'templates/map/map.html'
        })

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
        }); 

    // Event routes
    $stateProvider
        .state('events', {
            url: '/events?view',
            templateUrl: 'templates/events/events.html'
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
            templateUrl: 'templates/amenities/amenity.html'
        });
		
	$stateProvider
	        .state('tours', {
	            url: '/tours',
	            templateUrl: 'templates/tours/tours.html'
	        });
    $stateProvider   
            .state('tourlistview',{
                url: '/list',
                templateUrl: 'templates/tours/tourlist.html'
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

}]);
