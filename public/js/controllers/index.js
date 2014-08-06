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