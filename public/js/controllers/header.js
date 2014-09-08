'use strict';

angular.module('app.controllers').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus','NavService',
    function($scope, $rootScope, Global, Menus, NavService) {
        $scope.global = Global;
        $scope.menus = {};

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

controllers.controller('NavController', ['$scope','$location', '$filter','NavService', 'Shared', 'Events', function($scope, $location, $filter, NavService, Shared, Events){
    console.log('In NavController');
    var path = $location.path();
    //0 1 2 3...
    var paths=["/","/about","/events/grid","/map","/tours","/ferry", "/events/list", '/weather'];

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

    //For the landing page area
    //$scope.featured=$filter('SelecteByFeatured')('main');
    //TODO: only query fo featured Events
    Events.query(function(events){
        $scope.featured = events.filter(function(event){
            return event.isFeatured && event.isFeatured.indexOf('main') >=0;
        });
    });
    $scope.subEvents=$filter('subSelectByType')('active');
    console.log("testing= "+ $scope.subEvents);
    /* need to be fix niquepg
    console.log("the featured= "+ $scope.featured);
    $scope.initLanding=function(tmp){
        return (tmp===0);
    };
    */
    var allFilters = Shared.allFilters = ['info', 'food', 'drink', 'activity', 'venue', 'facility', 'tour', 'event', 'alert'];
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

    $scope.isFilterActive = function(filter){
        var filters = $scope.filters;
        for(var i = filters.length - 1; i >= 0; i--){
            if(filters[i] === filter){
                return true;
            }
        }
        return false;
    };

    $scope.Shared = Shared;
    $scope.$watch('Shared.filters', function(newVal, oldVal){
        /*this function exists because even though 99% of the time NavController is the one updating the filters,
        it still needs to honor changes to the filters made elsewhere in the app, ex map.js setupMap*/
        if(!newVal){
            return;
        }
        $scope.filters = Shared.filters;
    }, true);
}]);

controllers.controller('AlertsController', ['$scope', '$cookies', 'Shared', function($scope, $cookies, Shared){
    console.log('In AlertsController');

    $scope.unreadAlertsCount = 0;
    $scope.activeAlert = null;

    $scope.isAlert = function(){
        // TODO: Lonique, do we still need this?
        return true;
    };

    $scope.isAlertViewed = function(alert){
        var viewedAlerts = $cookies.alerts;
        return viewedAlerts && viewedAlerts.indexOf(alert.id) >= 0;
    };

    $scope.setAlertViewed = function(alert){
        if($scope.isAlertViewed(alert)){
            return;
        }

        var viewedAlerts = $cookies.alerts;
        if(!viewedAlerts){
            viewedAlerts = alert.id;
        }
        else{
            viewedAlerts = viewedAlerts.concat(',' + alert.id);
        }
        $cookies.alerts = viewedAlerts;

        var unreadAlertsCount = $scope.unreadAlertsCount; 
        if(unreadAlertsCount){
            $scope.unreadAlertsCount = unreadAlertsCount - 1;
        }
    };

    $scope.isActiveAlert = function(alert){
        return $scope.activeAlert == alert;
    };

    $scope.toggleActiveAlert = function(alert){
        if($scope.isActiveAlert(alert)){
            return $scope.activeAlert = null;
        }
        $scope.activeAlert = alert;
    };

    $scope.$watch(function(){return Shared.alerts}, function(alerts, oldVal){
        if(!alerts){ return;}

        var unreadAlertsCount = 0;

        for (var i = alerts.length - 1; i >= 0; i--) {
            var alert = alerts[i]
            if($scope.isAlertViewed(alert)){
                continue;
            }
            unreadAlertsCount++;

        };
        $scope.unreadAlertsCount = unreadAlertsCount;
    }, true);
}]);