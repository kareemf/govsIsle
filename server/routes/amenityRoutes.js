'use strict';

var amenities = require('../controllers/amenitiesController'),
    authorization = require('./middlewares/authorization');

module.exports = function(app) {
    var baseUrl = '/api/v1/amenities';

    app.route(baseUrl)
        .get(amenities.all)
        .post(authorization.requiresLogin, amenities.create);

    app.route(baseUrl + '/:amenityId')
        .get(amenities.show)
        .put(authorization.requiresLogin, amenities.update)
        .delete(authorization.requiresLogin, amenities.destroy);

    app.route(baseUrl + '/:amenityId/publish')
        .post(amenities.publish);

    app.route(baseUrl + '/slug/:amenitySlug')
        .get(amenities.show);

    app.route(baseUrl + '/search/:search')
        .get(amenities.search);

    app.param('amenityId', amenities.get);
    app.param('amenitySlug', amenities.getBySlug);

};
