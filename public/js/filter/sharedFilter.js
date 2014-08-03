'use strict';
var filters = angular.module('app.filter');

//filter for trusted html
filters.filter('trustedHtml', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

filters.filter('SelecteByType', ['SiteData', function(SiteData){
    return function(type) {

    	var temp = SiteData.getEvents(),
    				typeArray= [];

    	for( var i=0; i<temp.length; i+=1){
    		if(temp[i].type===type){
    			typeArray.push(temp[i]);
    		}
    	}
        return typeArray;
    };
}]);

filters.filter('SelecteByFeatured', ['SiteData', function(SiteData){
    return function(featured) {

    	var temp = SiteData.getEvents(),
    				typeArray= [];
    	
    	for( var i=0; i<temp.length; i+=1){
    		if(temp[i].isFeautred===featured){
    			typeArray.push(temp[i]);
    		}
    	}
        return typeArray;
    };
}]);