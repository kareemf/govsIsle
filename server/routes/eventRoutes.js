'use strict';

// Events routes use events controller
var events = require('../controllers/eventsController'),
    authorization = require('./middlewares/authorization');

// Event authorization helpers
var hasAuthorization = function(req, res, next) {
    if (req.event.createdBy.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {
    var baseUrl = '/api/v1/events';

    app.route(baseUrl)
        .get(events.all)
        .post(authorization.requiresLogin, events.create);

    app.route(baseUrl + '/:eventId')
        .get(events.show)
        .put(authorization.requiresLogin, hasAuthorization, events.update)
        .delete(authorization.requiresLogin, hasAuthorization, events.destroy);

    app.param('eventId', events.get);
};
