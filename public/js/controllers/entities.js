/**
 * To use:
 * $controller('BaseEntityController', {$scope: $scope});
 * $scope.Resource = {Angular Resource}
 * $scope.saveSuccessCallback = function(entity, headers)
 * $scope.saveFailureCallback = function(entity, headers)
 * $scope.updateSuccessCallback = function(entity, headers)
 * $scope.updateFailureCallback = function(entity, headers)
 */
controllers.controller('BaseEntityController', ['$scope', '$rootScope', function($scope, $rootScope){
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
    }
}]);