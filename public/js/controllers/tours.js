'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('ToursController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    	console.log('in TourController');
		
		$scope.getImageSrc = function (imageFile) {
		  return 'http://www.entangledspace.com/staging/' + imageFile;
		};

	    $http.get('http://entangledspace.com/staging/getTours.php?username=cultureisland&bl_lat=40.5&bl_lng=-74.1&tr_lat=40.7&tr_lng=-74.0').
	           success(function(data) {
	               $scope.allTours = data;
				   
				$scope.allTourpoints = [];   
	   			var log = [];
	   			angular.forEach($scope.allTours, function(value) {
					
	   	   	    	$http.get('http://entangledspace.com/staging/getTourpoints.php?username=cultureisland&tourID='+value.id+'').
	   	   	           success(function(data_2) {	
	
	   	   	               var log2 = [];
						   angular.forEach(data_2, function(point) {
							   $scope.allTourpoints.push(point);
							   //alert(point);
						   }, log2);
					   
	   	   	    	   });

	   			}, log);
				//alert($scope.allTourpoints);
				
				   
	    });
		
}]);


controllers.controller('TourpointDetailController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    console.log('in TourpointDetailController');
	
	$scope.getAudioSrc = function (audioFile) {
	  return 'http://www.entangledspace.com/staging/' + audioFile;
	};
	
	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/staging/' + imageFile;
	};
	
   $scope.playing = false;
   $scope.audio = document.getElementById('audioPlayer');
	
   $scope.play = function() {
	    $scope.audio.play();
	    $scope.playing = true;
   };
   
   $scope.stop = function() {
	    $scope.audio.pause();
	    $scope.playing = false;
   };
   
   $scope.audio.addEventListener('ended', function() {
	    $scope.$apply(function() {
	      $scope.stop()
	    });
   });

   var id = $stateParams.id;
   if(id){

	    $http.get('http://entangledspace.com/staging/getPost.php?username=cultureisland&postID='+id).
	           success(function(data) {
	               $scope.tourpoint = data;
		   		   $scope.audio.src = $scope.getAudioSrc($scope.tourpoint.clipLoc);
	    });
		
		
		
    }
}]);

controllers.controller('TourListController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http){
    console.log('in TourListController');
	

	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/staging/' + imageFile;
	};
	
    var id = $stateParams.id;
    if(id){
		
	    $http.get('http://entangledspace.com/staging/getTour.php?username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tour = data;
	    });

	    $http.get('http://entangledspace.com/staging/getTourpoints.php?username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tourpoints = data;
	    });
		
    }
	
}]);