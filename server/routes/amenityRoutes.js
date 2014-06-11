'use strict';

var amenities = require('../controllers/amenitiesController'),
    authorization = require('./middlewares/authorization');

// Amenity authorization helpers
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

    app.route(baseUrl + '/:amenityId')
        .get(amenities.show)
        .put(authorization.requiresLogin, hasAuthorization, amenities.update)
        .delete(authorization.requiresLogin, hasAuthorization, amenities.destroy);

    app.param('amenityId', amenities.get);
};
