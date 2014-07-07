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
    //Lading page routes
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'templates/landing.html'
        })

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
            templateUrl: 'templates/events/events.html',
        })
        .state('events.map',{
            templateUrl: 'templates/events/eventmap.html'
        })
        .state('events.list',{
            templateUrl: 'templates/events/eventlist.html'
        })
        .state('events.calendar',{
            templateUrl: 'templates/events/eventcalendar.html'
        })
        .state('events.detail', {
            url: '/:slug',
            templateUrl: 'templates/events/event.html',
        });
    $urlRouterProvider.otherwise('/home');

}])
