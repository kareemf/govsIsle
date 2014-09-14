'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('SearchController', ['$scope', '$stateParams', 'Events', function($scope, $stateParams, Events){
	var query = $scope.query = $stateParams.q;
	$scope.eventResults = [];

	Events.search({q: query}, function(results){
		console.log('search results', results);
		$scope.eventResults = results;
	});

	// TODO: query audio tours
	// TODO: query alerts
	// TODO: query amenities
}])