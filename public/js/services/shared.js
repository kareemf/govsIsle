'use strict';
var services = angular.module('app.services');

services.factory('Shared', [function(){
	var self = this;
	self.data = {
        getMarkerGeoLocation: function(marker){
            //8/6/14: Position.A seems to have been replaced with position.B
            var position = marker.position
            return [position.k, position.A || position.B];
        }
    };
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

services.factory('SiteData', function($rootScope){
    var subEvents= [
        {'id':1,
         'name': 'Discover',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 2,
         'link': 'events.grid',
         'media': "images/landing/Thumb_discover_320x250.jpg"
        },
        {'id':2,
         'name': 'Eat',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home',
         'media': "images/landing/Thumb_eat_320x250.jpg"
        },
        {'id':3,
         'name': 'Enjoy',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 3,
         'link': 'home',
         'media': "images/landing/Thumb_enjoy_320x250.jpg"
        },
        {'id':4,
         'name': 'Learn',
         'type': 'active',
         'visibility': 'public',
         'activeBtn': 4,
         'link': 'tours',
         'media': "images/landing/Thumb_learn_320x250.jpg"
        }
    ];

    return {
        updateSiteData : function(newval) {
            $rootScope.$broadcast('YChanged', activelink);
        },
        getEvents :function(){return events;},
        getSubEvents :function(){return subEvents;},

   };
})

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

