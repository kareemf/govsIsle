services.factory('Alerts', ['$resource', function($resource){
    var alertUrl = 'api/v1/alerts/:alertId';
    return $resource(alertUrl, {
        alertId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug:{
            url: alertUrl + '/slug/:slug',
            method: 'GET'
        }
    });
}]);
