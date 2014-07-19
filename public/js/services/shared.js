'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {};
	return self.data;
}]);

services.factory('NavService',function($rootScope){
    var navHeader=true;
    return {
        increase : function() {
            navHeader=true;
            $rootScope.$broadcast('XChanged', navHeader);
        },
        decrease: function(){
        	navHeader=false;
        	$rootScope.$broadcast('XChanged', navHeader);
        }
   };
})
