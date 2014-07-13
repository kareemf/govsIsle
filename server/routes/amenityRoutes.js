'use strict';

var amenities = require('../controllers/amenitiesController'),
    authorization = require('./middlewares/authorization');

var hasAuthorization = function(req, res, next) {
    if (!req.amenity.createdBy.equals(req.user.id)) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {
    var baseUrl = '/api/v1/amenities';

    app.route(baseUrl)
        .get(amenities.all)
        .post(authorization.requiresLogin, amenities.create);

    app.route(baseUrl + '/:id')
        .get(amenities.show)
        .put(authorization.requiresLogin, amenities.update)
        .delete(authorization.requiresLogin, amenities.destroy);

    app.route(baseUrl + '/:id/publish')
        .post(amenities.publish);

    app.route(baseUrl + '/slug/:slug')
        .get(amenities.show);

    app.param('id', amenities.get);
    app.param('slug', amenities.getBySlug);

};
