'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('NavController', ['$scope','$location', 'NavService',function($scope, $location, NavService){
    console.log('In NavController');
   	var path = $location.path();
    $scope.headerview=true;
    
    var paths=["/","/about","/events/list","/events/map","events/tour","/ferry"];

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

}]);