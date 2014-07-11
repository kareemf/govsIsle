'use strict';

var media = require('../controllers/mediaController'),
    authorization = require('./middlewares/authorization');

module.exports = function(app) {
    var baseUrl = '/api/v1/media';

    app.route(baseUrl)
        .get(authorization.requiresLogin, media.all)

    app.route(baseUrl + '/:mediaId')
        .get(media.render)
        .put(authorization.requiresLogin, media.update)
        .delete(authorization.requiresLogin, media.destroy);

    app.route(baseUrl + '/slug/:mediaSlug')
        .get(media.render);

    app.route(baseUrl + '/info/:mediaId')
        .get(media.show);

    app.route(baseUrl + '/:modelType/:modelId')
        .post(authorization.requiresLogin, media.create);

    app.param('modelType', media.getModelType);
    app.param('modelId', media.getModelInstance);

    app.param('mediaId', media.get);
    app.param('mediaSlug', media.getBySlug);

};
