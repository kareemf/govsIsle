'use strict';

// User routes use users controller
var users = require('../controllers/calendarController');
module.exports = function(app) {
	app.get('/test', function(req,res){
		res.render('landing.html');
	})
}