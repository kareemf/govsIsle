'use strict';
var weather = require('../controllers/weatherController');

module.exports = function(app) {
	var baseUrl = '/api/v1/weather';

    app.route(baseUrl)
  		.get(weather.get);
};