'use strict';

var alerts = require('../controllers/alertsController'),
    authorization = require('./middlewares/authorization');

module.exports = function(app) {
    var baseUrl = '/api/v1/alerts';

    app.route(baseUrl)
        .get(alerts.all)
        .post(authorization.requiresLogin, alerts.create);

    app.route(baseUrl + '/search')
        .get(alerts.search);

    app.route(baseUrl + '/:alertId')
        .get(alerts.show)
        .put(authorization.requiresLogin, alerts.update)
        .delete(authorization.requiresLogin, alerts.destroy);

    app.route(baseUrl + '/:alertId/publish')
        .post(alerts.publish);

    app.param('alertId', alerts.get);

};
