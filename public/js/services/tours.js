'use strict';

var services = angular.module('app.services');

services.factory('Tours', ['$http', function($http){

		var rootUrl = 'http://entangledspace.com/api/v1/';
		var apiToken = '?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8';
	
		var _tours = [];
		var _myTours = [];
		var _contributedTours = [];
		var _tourpoints = [];
		
	    var eventUrl = 'http://entangledspace.com/api/v1/getTours.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&lat=40.5&lng=-74.1&thresh=1.0';
	
		var factory = {};
	
		//for the tour list
		factory.getTours = function() {
		
			var endpoint = 'getTours.php';
			var query = '&lat=40.691287&lng=-74.017555&thresh=0.01';
		
			//empty the resource
			_tours = [];
		
		    $http.get( rootUrl + endpoint + apiToken + query ).
		           success(function(data) {
					   
					   for(var i in data['tours']) {
						   
					       _tours.push(data['tours'] [i]);
						   
					   }
		               
					   //alert();		
					   //console.log(_tours[0][1]);   
					   //console.log(_tours[0][1].id);
		    });

			return _tours;
			
		};
		
	
		
		factory.getMyTours = function() {
		
			var endpoint = 'getTours.php';
			var query = '&username=cultureisland';
			
			_myTours = [];
		
		    $http.get( rootUrl + endpoint + apiToken + query ).
		           success(function(data) {
					   for(var i in data['tours']) {
						   
					       _myTours.push(data['tours'] [i]);
						   
					   }				   
		    });
		
			return _myTours;
		};
		
		
		factory.getTourpoints = function(cb) {
				
			var _tourpoints = [];
		    $http.get('http://entangledspace.com/api/v1/getTourpoints.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland').
		           success(cb);
			
			/*
  			console.log("-----------------------------");
  			console.log(_tourpoints);
  			console.log("-----------------------------");
			
			return _tourpoints;
			**/
		};
		
		
		
		
		factory.getContributedTours = function() {
		

			var endpoint = 'getTours.php';
			var query = '&lat=40.691287&lng=-74.017555&thresh=0.01';
		
			_contributedTours = [];
			
		    $http.get( rootUrl + endpoint + apiToken + query ).
		           success(function(data) {
					   for(var i in data['tours']) {
						   
						   if(data['tours'][i].userID != 24) {
					       		_contributedTours.push(data['tours'] [i]);
						   }
						   
					   }				   
		    });
		
			return _contributedTours;
			
			
		};
		
		
		
		
		factory.getPost = function($id) {
							
		    $http.get('http://entangledspace.com/api/v1/getPost.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&postID='+$id ).
		           success(function(data) {
					   return data['post'];			   
		    });			
			
		};
		
		
		
		
		var thisTour = {};
		factory.getTour = function($id) {
								
		    $http.get('http://entangledspace.com/api/v1/getTour.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&tourID='+$id).
		           success(function(data) {
		               thisTour =  data['tour_data'];	
		   					
		   				return thisTour;
		    });	
			
			
		};
		
	    
		
		

	    
		
		

	
		//for map
		/**
		factory.getTourpoints = function() {
		
			var endpoint = 'getTourpoints.php?token=' + apiToken + '';
			var query = '&username=cultureisland';
		
			//make sure the tour array is populated first
			getTours();
		
			//populate tourpoint array
			var log = [];
			angular.forEach(_tours, function(value) {
			
				var tps = $resource(rootUrl + endpoint + apiToken + "&username=cultureisland&tourID=" + value.id + "");
	
	   	               var log2 = [];
					   angular.forEach(tps['tour_points'], function(point) {
						   _tourpoints.push(point);
					   }, log2);
			   
	   	    	   });

				}, log);
		
			return _tourpoints;
		
		}
		**/
		
		/**
		factory.getPost = function(id) {
		    angular.forEach(_tourpoints, function(value) {
		    	if (value.id == id) {
		    		return value;
		    	}
		    }
			return false;
		}
		**/
	
		/**
		factory.getAudioSrc = function (audioFile) {
		  return 'http://www.entangledspace.com/data/postAudio/' + audioFile;
		}
	
		factory.getImageSrc = function (imageFile) {
		  return 'http://www.entangledspace.com/data/postImages/' + imageFile;
		}
		**/
   
	return factory;
	
}]);