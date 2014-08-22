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

    var socket = io.connect(window.location.origin);
    Shared.alerts = [];

    socket.on('connect', function () {
        console.log('connected to web socket');
        if($rootScope.user){
            socket.emit('authenicated_connection', $rootScope.user);
        }
    });

    socket.on('alerts', function(alerts){
        console.log('alerts recieved', alerts);
        Shared.alerts = Shared.alerts.concat(alerts);
    });

    socket.on('alert', function(alert){
        console.log('alert recieved', alert);
        Shared.alerts.push(alert);
    });
}]);