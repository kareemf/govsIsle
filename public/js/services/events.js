services.factory('Events', ['$resource', function($resource){
    var eventUrl = 'api/v1/events/:eventId';
    return $resource(eventUrl, {
        eventId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: eventUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);
