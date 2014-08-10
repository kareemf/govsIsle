'use strict';
var filters = angular.module('app.filter');

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
//going to improve for now. ill repeat code 
filters.filter('subSelectByType', ['SiteData', function(SiteData){
    return function(type) {

        var temp = SiteData.getSubEvents(),
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
    return function(typeOfFeature) {

    	var temp = SiteData.getEvents(),
    				theArray= [];
    	
    	for( var i=0; i<temp.length; i+=1){
    		if(temp[i].isFeautred.indexOf(typeOfFeature) >=0){
    			theArray.push(temp[i]);
    		}
    	}
        return theArray;
    };
}]);