'use strict';

var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {};
	return self.data;
}]);