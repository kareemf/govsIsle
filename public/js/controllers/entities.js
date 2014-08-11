/**
 * To use:
 * $controller('BaseEntityController', {$scope: $scope});
 * $scope.Resource = {Angular Resource}
 * $scope.saveSuccessCallback = function(entity, headers)
 * $scope.saveFailureCallback = function(entity, headers)
 * $scope.updateSuccessCallback = function(entity, headers)
 * $scope.updateFailureCallback = function(entity, headers)
 */
controllers.controller('BaseEntityController', ['$scope', '$rootScope', '$upload', function($scope, $rootScope, $upload){
    $scope.save = function(entity){
        console.log('saving Entity', entity);
        // TODO: validate

        $scope.Resource.save(entity, $scope.saveSuccessCallback, $scope.saveFailureCallback);
    };

    $scope.update = function(entity){
        console.log('updating Entity', entity);
        // TODO: validate

        $scope.Resource.update(entity, $scope.updateSuccessCallback, $scope.updateFailureCallback);
    };

    $scope.togglePublished = function(entity){
        if (entity.published) {
            entity.published = null;
            entity.publishedBy = null;
            $scope.isPublished = false;
        }
        else {
            entity.published = new Date();
            entity.pushedBy = $rootScope.user.id;
            $scope.isPublished = true;
        }
    };

    $scope.coverPhotoUpload = function($files) {
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: 'api/v1/events/' + event.id,
                method: 'PUT',
                file: file, // or list of files ($files) for html5 only
                fileFormDataName: 'coverPhoto', //or a list of names for multiple files (html5). Default is 'file'
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                console.log('file upload success', data, status, headers, config);
            }).error(function(){
                console.log('file upload faile.');
            });

        }
    };
}]);