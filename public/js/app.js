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
    //Home routes
    $stateProvider
        .state('home', {
            url: '/home?view',
            templateUrl: 'templates/home/home.html'
        })
        .state('home.mapView', {
            templateUrl: 'templates/home/map.html'
        })
        .state('home.listView', {
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
            url: '/events',
            templateUrl: '/templates/events/events.html',

        })
        .state('events.detail', {
            url: '/:slug',
            templateUrl: '/templates/events/event.html',
        });

    $urlRouterProvider.otherwise('/home');

}])
