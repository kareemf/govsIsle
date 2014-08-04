'use strict';

angular.module('app.controllers').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus','NavService',
    function($scope, $rootScope, Global, Menus, NavService) {
        $scope.global = Global;
        $scope.menus = {};
        //service now in control of updating foo
        /*
        $scope.$watch(
            function(){return NavService.navHeader}, function(newVal, oldVal){
            console.log('NavService.navHeader', newVal, oldVal);
            $scope.headerview = NavService.navHeader;
        });    
        */

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
            //queryMenu('main', defaultMainMenu);
            $scope.global = {
                authenticated: !! $rootScope.user,
                user: $rootScope.user
            };
        });
    }
]);

controllers.controller('NavController', ['$scope','$location', 'NavService', 'Shared', function($scope, $location, NavService, Shared){
    console.log('In NavController');
    var path = $location.path();
    $scope.headerview=true;
    
    var paths=["/","/about","/events/grid","/events/map","/tours","/ferry", "/events/list"];

    $scope.currentLink=paths.indexOf(path);
    console.log($scope.currentLink+"link");
    
    $scope.activelink = function(numbtn) {
        NavService.updateBtn(numbtn);            
    };
    $scope.isActive=function(checkTab){
        return NavService.getBtn()===checkTab;
    };
    $scope.buttonswap= function(){  
        return NavService.getHiddenBtn();
    };
    $scope.$on('XChanged', function(event, x) {
       $scope.currentLink = x;
    });


    var allFilters = Shared.allFilters = ['info', 'food', 'drink', 'activity', 'venue', 'facility', 'tour', 'event'];
    $scope.filters = allFilters;

    $scope.toggleFilters = function(oneOrMoreFilters){
        //console.log('toggleFilter!');
        var scopeFilters = $scope.filters;
        var filters = oneOrMoreFilters.split(", ");

        if(filters.indexOf('all') >= 0){
            if(scopeFilters.length){
                //turn all filters off
                scopeFilters = [];
            }
            else{
                //turn all filters on
                scopeFilters = allFilters;
            }
        }
        else{
            for (var i = filters.length - 1; i >= 0; i--) {
                var filter = filters[i];
                if(scopeFilters.indexOf(filter) >= 0){
                    scopeFilters = scopeFilters.filter(function(f){
                        return f != filter
                    });
                }
                else{
                    scopeFilters.push(filter);
                }
            };
        }

        $scope.filters = scopeFilters;
       // console.log('scopeFilters', scopeFilters);

        Shared.filters = scopeFilters;
    };

}]);