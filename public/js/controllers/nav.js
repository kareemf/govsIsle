'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('NavController', ['$scope','$location', '$state', '$stateParams', 'NavService',function($scope, $location, $state, $stateParams, NavService){
    // console.log('In HomeController. $stateParams.view', $stateParams.view);
   	var view = $stateParams.view;
   	var path = $location.path();
    view = view ? view : 'map';
    //$state.go(path+"."+ view);
    $scope.navHeader = true;
    $scope.showNav= function() {
        NavService.increase();            
    }
    $scope.hideNav= function() {
        NavService.decrease();
    }   
    $scope.$on('XChanged', function(event, x) {
        $scope.navHeader = x;
    });

    $scope.isHome=false;
    if(path==='/'){
    	$scope.isHome=true;
    }

    $scope.headerview=true;
    $scope.listormap=true;
    $scope.uiup=true;

    /*
        $scope.$watch(function(){return Shared.uiup}, function(newVal, oldVal){
        console.log('Shared.uiup changed', newVal, oldVal);
        $scope.headerview = Shared.uiup;
    });

*/

}]);