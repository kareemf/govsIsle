'use strict';

var controllers = angular.module('app.controllers', []);
var services = angular.module('app.services', []);

var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'ngResource',
    'ui.router',
    'ui.map']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // System routes
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'templates/home.html'
        })
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
    // Event routes
    $stateProvider
        .state('events', {
            url: '/events',
            templateUrl: 'templates/events/events.html'
        })
        .state('events.detail', {
            url: '/events/:eventSlug',
            templateUrl: 'templates/events/event.html'
        });

    // Amenities routes
    $stateProvider
        .state('amenities', {
            url: '/amenities',
            templateUrl: 'templates/amenities/amenities.html'
        })
        .state('amenities.detail', {
            url: '/amenities/:amenitieslug',
            templateUrl: 'templates/amenities/amenity.html'
        });

    $urlRouterProvider.otherwise('/');

}])
