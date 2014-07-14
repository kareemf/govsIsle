services.factory('Amenities', ['$resource', function($resource){
    var amenityUrl = 'api/v1/amenities/:amenityId';
    return $resource(amenityUrl, {
        amenityId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: amenityUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);
