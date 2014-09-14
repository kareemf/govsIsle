'use strict';

// Events routes use events controller
var events = require('../controllers/eventsController'),
    authorization = require('./middlewares/authorization');

// Event authorization helpers
var hasAuthorization = function(req, res, next) {
    // console.log('hasAuthorization? user', req.user, 'event', req.event);
    if (!req.event.createdBy.equals(req.user.id)) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {
    var baseUrl = '/api/v1/events';

    app.route(baseUrl)
        .get(events.all)
        .post(authorization.requiresLogin, events.create);

    app.route(baseUrl + '/search')
        .get(events.search);

    app.route(baseUrl + '/:eventId')
        .get(events.show)
        .put(authorization.requiresLogin, events.update)
        .delete(authorization.requiresLogin, events.destroy);

    app.route(baseUrl + '/:eventId/publish')
        .post(events.publish);

    app.route(baseUrl + '/slug/:eventSlug')
        .get(events.show);

    app.param('eventId', events.get);
    app.param('eventSlug', events.getBySlug);

};
