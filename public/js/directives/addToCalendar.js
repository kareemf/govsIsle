'use strict';
var directives = angular.module('app.directives');

directives.directive('toCalendar', function(SiteData){
	return{
	 	restrict: 'E',
	 	scope:{
	 		cal:  '=',
	 		title: '='
	 	},
	 	templateUrl:"templates/directives/calendarForm.html",
	 	controller: function($scope){
	 	}
	};
});