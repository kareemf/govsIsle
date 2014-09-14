'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('SearchController', ['$scope', '$stateParams', 'Events', function($scope, $stateParams, Events){
	$scope.searchTerm = $stateParams.q;
	$scope.types = $stateParams.types;
	$scope.eventResults = [];

	var query = $scope.query = function(searchTerm, types){
		if(!angular.isArray(types)){
			types = types.split(',');
		}

		if(types.indexOf('events') >= 0){
			Events.search({q: searchTerm}, function(results){
				console.log('search results', results);
				$scope.eventResults = results;
			});
		}
	};

	$scope.query($scope.searchTerm, $scope.types);

	// TODO: query audio tours
	// TODO: query alerts
	// TODO: query amenities
}])