'use strict';

var media = require('../controllers/mediaController');

module.exports = function(app) {
    var baseUrl = '/api/v1/media';

    app.route(baseUrl + '/:modelType/:modelId')
        .post(media.create);

    app.param('modelType', media.getModelType);
    app.param('modelId', media.getModelInstance);
};
