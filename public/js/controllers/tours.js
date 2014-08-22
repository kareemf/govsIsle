'use strict';

var controllers = angular.module('app.controllers');

controllers.controller('ToursController', ['$scope', '$stateParams', '$http', 'Tours', function($scope, $stateParams, $http, Tours){
    	
		console.log('in TourController');
		
		$scope.entangledToken = 'a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8';
		
		$scope.getImageSrc = function (imageFile) {
			//alert(imageFile);
		  return 'http://www.entangledspace.com/data/' + imageFile;
		};
		
		$scope.myTours = Tours.getMyTours();
		$scope.contributedTours = Tours.getContributedTours();
				
}]);


controllers.controller('TourpointDetailController', ['$scope', '$stateParams', '$http', 'Tours', function($scope, $stateParams, $http, Tours){
    console.log('in TourpointDetailController');
	
	$scope.getAudioSrc = function (audioFile) {
	  return 'http://www.entangledspace.com/data/postAudio/' + audioFile;
	};
	
	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/data/postImages/' + imageFile;
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
   $scope.tID = 9;
   if(id){

	    
	    $http.get('http://entangledspace.com/api/v1/getPost.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&postID='+id+'&tourID='+9+'').
	           success(function(data) {
	               $scope.tourpoint = data['post'];
		   		   $scope.audio.src = $scope.getAudioSrc($scope.tourpoint.clipLoc);
				   
	    });
		
	   
	   //$scope.tourpoint = Tour.getPost(id);
	   //$scope.audio.src = $scope.getAudioSrc($scope.tourpoint.clipLoc);
		
		
    }
}]);

controllers.controller('TourListController', ['$scope', '$stateParams', '$http', 'Tours', function($scope, $stateParams, $http, Tours){
    console.log('in TourListController');
	

	$scope.getImageSrc = function (imageFile) {
	  return 'http://www.entangledspace.com/data/' + imageFile;
	};
	
    var id = $stateParams.id;
    if(id){
		

	    $http.get('http://entangledspace.com/api/v1/getTour.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tour = data['tour_data'];
	    });

	    $http.get('http://entangledspace.com/api/v1/getTourpoints.php?token=a02e0202572aa6bf75423b9e355bb239ecc5ff849ffd000933b97ef292c09cc8&username=cultureisland&tourID='+id).
	           success(function(data) {
	               $scope.tourpoints = data['tour_points'];
	    });
		
		//$scope.tour = Tours.getTour(id);
		//$scope.tourpoints = Tours.getTourpoints(id);
		
		//console.log(Tours.getTour(id)); 
		
    }
	
}]);


controllers.controller('TourMarkerController', ['$scope', '$controller', function($scope, $controller){

    var marker = $scope.marker;

    var getMarkerGeoLocation = [ $scope.marker.entity.latitude, $scope.marker.entity.longitude];

	//$scope.marker.entity.name = $scope.marker.entity.postName;
	//console.log($scope.marker.entity.postName);


}]);

