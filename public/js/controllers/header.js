'use strict';

angular.module('app.controllers').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus', 'Shared',
    function($scope, $rootScope, Global, Menus, Shared) {
        $scope.global = Global;
        $scope.menus = {};
        $scope.headerview=true;
        $scope.uiup=true;

        $scope.$watch(function(){return Shared.uiup}, function(newVal, oldVal){
            console.log('Shared.uiup changed', newVal, oldVal);
            $scope.headerview = Shared.uiup;
        });

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function(menu) {
                $scope.menus[name] = menu;
            });
        }

        // Query server for menus and check permissions
        queryMenu('main', defaultMainMenu);

        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function() {

            queryMenu('main', defaultMainMenu);

            $scope.global = {
                authenticated: !! $rootScope.user,
                user: $rootScope.user
            };
        });

    }
]);
