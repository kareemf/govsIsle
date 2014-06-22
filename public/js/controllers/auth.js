'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('LoginController', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        // This object will be filled by the form
        $scope.user = {};

        // Register the login() function
        $scope.login = function(user) {
            console.log('attempting login for user', user);

            $http.post('/login', {
                email: user.email,
                password: user.password
            })
            .success(function(response) {
                // authentication OK
                console.log('login success. response', response);

                $scope.loginError = '';
                $scope.isLoggedIn = true;

                $rootScope.user = response.user;
                $rootScope.$emit('loggedin');

                if (response.redirect) {
                    if (window.location.href === response.redirect) {
                        //This is so an admin user will get full admin page
                        window.location.reload();
                    } else {
                        window.location = response.redirect;
                    }
                } else {
                    $location.url('/');
                }
            })
            .error(function() {
                console.log('login failure');

                $scope.loginError = 'Authentication failed.';
            });
        };

        $scope.checkLoggedIn = function(){
            $http.get('/loggedin')
            .success(function(response) {
                console.log('loggedin check success. response', response);
                if(angular.isObject(response) && response._id){
                    console.log('logged in user', response);

                    $scope.isLoggedIn = true;
                }
            })
            .error(function() {
                console.log('loggedin check failure');
            });
        };

        $scope.checkLoggedIn();

    }
]);

controllers.controller('RegisterController', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
        $scope.user = {};

        $scope.register = function(user) {
            $scope.usernameError = null;
            $scope.registerError = null;

            $http.post('/register', {
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword,
                username: user.username,
                name: user.name
            })
            .success(function() {
                // authentication OK
                $scope.registerError = 0;
                $rootScope.user = $scope.user;
                $rootScope.$emit('loggedin');
                $location.url('/');
            })
            .error(function(error) {
                // Error: authentication failed
                if (error === 'Username already taken') {
                    $scope.usernameError = error;
                } else {
                    $scope.registerError = error;
                }
            });
        };
    }
]);