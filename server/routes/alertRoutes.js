'use strict';

var alerts = require('../controllers/alertsController'),
    authorization = require('./middlewares/authorization');

var hasAuthorization = function(req, res, next) {
    if (!req.amenity.createdBy.equals(req.user.id)) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {
    var baseUrl = '/api/v1/alerts';

    app.route(baseUrl)
        .get(alerts.all)
        .post(authorization.requiresLogin, alerts.create);

    app.route(baseUrl + '/:id')
        .get(alerts.show)
        .put(authorization.requiresLogin, alerts.update)
        .delete(authorization.requiresLogin, alerts.destroy);

    app.route(baseUrl + '/:id/publish')
        .post(alerts.publish);

    app.route(baseUrl + '/slug/:slug')
        .get(alerts.show);

    app.param('id', alerts.get);
    app.param('slug', alerts.getBySlug);

};
