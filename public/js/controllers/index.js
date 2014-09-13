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
            
            var params = {};

            if(Shared.alerts){
            	//If the server shuts down while this socket is still connected,
            	//When reconnecting to the server, include ids of previously 
            	//recieved data, so as to not recieve duplicates
            	params.alreadyRecievedIds = Shared.alerts.map(function(alert){return alert.id});
            }
            
            if(user){
            	params.user = user;

                console.log('emitting authenicated_connection to websocket');
                socket.emit('authenicated_connection', params);
            }
            else{
                console.log('emitting anonymous_connection to websocket');
                socket.emit('anonymous_connection', params);
            }
        });

        socket.on('alerts', function(alerts){
            console.log('alerts received', alerts);
            Shared.alerts = Shared.alerts.concat(alerts);
            $scope.$apply();
        });

        socket.on('alert.created', function(alert){
            console.log('alert.created received', alert);
            Shared.alerts.push(alert);
            $scope.$apply();
        });

        socket.on('alert.updated', function(alert){
            console.log('alert.updated received', alert);
            for(var i = Shared.alerts.length - 1; i >= 0; i--){
                var _alert = Shared.alerts[i];
                if(alert._id !=_alert._id){ continue; }
                Shared.alerts[i] = alert;
                break;
            }
            $scope.$apply();
        });

        socket.on('alert.deleted', function(alert){
            console.log('alert.deleted received', alert);
            Shared.alerts = Shared.alerts.filter(function(_alert){
               return  alert._id != _alert._id;
            });
            $scope.$apply();
        });
    };

    checkLoggedIn(connectToSocket);

    $scope.$watch(function(){return Shared.alerts},function(){
        $scope.alerts = Shared.alerts;
    });
}]);

controllers.controller('WeatherUpdateController', ['$scope', 'Weather', function($scope,Weather){
    console.log('In WeatherUpdateController');

    $scope.yahooWeather=Weather.get();
    $scope.crossApi={   //cross reference 2 api. yahoo weather with weather icons ;-(
        "0": "wi-tornado",
        "1": "wi-day-storm-showers",
        "2": "wi-hurricane",
        "3": "wi-lightning",
        "4": "wi-lightning",
        "5": "wi-rain-mix",
        "6": "wi-rain-mix",
        "7": "wi-showers",
        "8": "wi-sprinkle",
        "9": "wi-sprinkle",
        "10": "wi-rain",
        "11": "wi-showers",
        "12": "wi-showers",
        "13": "wi-snow",
        "14": "wi-showers",
        "15": "wi-snow-wind",
        "16": "wi-snow",
        "18": "wi-hail",
        "19": "wi-rain-mix",
        "20": "wi-fog",
        "21": "wi-dust",
        "22": "wi-smoke",
        "23": "wi-cloudy-gusts",
        "24": "wi-cloudy-windy",
        "25": "wi-snowflake-cold",
        "26": "wi-cloudy",
        "27": "wi-night-cloudy",
        "28": "wi-day-cloudy",
        "29": "wi-night-cloudy",
        "30": "wi-day-cloudy",
        "31": "wi-night-clear",
        "32": "wi-day-sunny",
        "33": 'wi-night-cloudy',
        "34": 'wi-day-cloudy',
        "35": "wi-rain-mix",
        "36": "wi-hot",
        "37": "wi-thunderstorm",
        "38": "wi-night-thunderstorm",
        "39": "wi-day-thunderstorm",
        "40": "wi-showers",
        "41": "wi-snow-wind",
        "42": "wi-rain-mix",
        "43": "wi-day-snow",
        "44": "wi-cloudy",
        "45": "wi-storm-showers",
        "46": "wi-showers",
        "47": "wi-storm-showers",
        "3200": "wi-cloud-down"
    };

    $scope.mytest="night-partly-cloudy";
}]);

