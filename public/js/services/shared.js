'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {};
	return self.data;
}]);

services.factory('NavService',function($rootScope){
    var activelink=null, hideInfo=null;
    return {
        updateBtn : function(newval) {
            activelink=newval;
            $rootScope.$broadcast('XChanged', activelink);
        },
        getBtn :function(){
            return activelink;
        },
        getHiddenBtn : function(){
            if(activelink===2 || activelink===3 || activelink===4 || activelink===6){
                return true;
            }
            else{return false;}
        }
   };
})

/*
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
*/