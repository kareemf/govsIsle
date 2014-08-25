'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('AppController', ['$scope', '$rootScope', '$http', 'Shared',
function($scope, $rootScope, $http, Shared){
    var checkLoggedIn = function(callback){
        $http.get('/loggedin')
            .success(function(response) {
                console.log('loggedin check success. response', response);
                if(angular.isObject(response) && response._id){
                    console.log('logged in user', response);

                    $rootScope.user = response;                    
                }
                if(callback){
                    callback($rootScope.user);
                }
            })
            .error(function() {
                console.log('loggedin check failure');
                if(callback){
                    callback(null);
                }
            });
    };

    var connectToSocket = function(user){
        var socket = io.connect(window.location.origin);
        Shared.alerts = [];

        socket.on('connect', function(){
            console.log('connected to web socket');

            if(user){
                console.log('emitting authenicated_connection to websocket');
                socket.emit('authenicated_connection', user);
            }
            else{
                console.log('emitting anonymous_connection to websocket');
                socket.emit('anonymous_connection');
            }
        });

        socket.on('alerts', function(alerts){
            console.log('alerts received', alerts);
            Shared.alerts = Shared.alerts.concat(alerts);
        });

        socket.on('alert.created', function(alert){
            console.log('alert.created received', alert);
            Shared.alerts.push(alert);
        });

        socket.on('alert.updated', function(alert){
            console.log('alert.updated received', alert);
            for(var i = Shared.alerts.length - 1; i >= 0; i--){
                var _alert = Shared.alerts[i];
                if(alert._id !=_alert._id){ continue; }
                _alert = alert;
                break;
            }
        });

        socket.on('alert.deleted', function(alert){
            console.log('alert.deleted received', alert);
            Shared.alerts = Shared.alerts.filter(function(_alert){
               return  alert._id != _alert._id;
            });
        });
    };

    checkLoggedIn(connectToSocket);
}]);