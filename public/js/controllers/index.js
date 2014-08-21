'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('AppController', ['$rootScope', '$http', 'Shared',function($rootScope, $http, Shared){
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

    var socket = io.connect('http://localhost:3000');
    Shared.alerts = [];

    socket.on('alert', function(alert){
        console.log('alert recieved', alert);
        Shared.alerts.push(alert);
    });
}]);