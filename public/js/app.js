'use strict';

var controllers = angular.module('app.controllers', []);
var services = angular.module('app.services', []);

var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'ngResource',
    'google-maps',
    'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'templates/home.html'
    })
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html'
    })
}])
