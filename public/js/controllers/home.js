'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('HomeController', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams){
    // console.log('In HomeController. $stateParams.view', $stateParams.view);
    var view = $stateParams.view;
    view = view ? view : 'map';
    // console.log('changeing to home state:', view);
    if(view === 'map'){
    	return $state.go(view);
    }
    $state.go('home.' + view);
}]);