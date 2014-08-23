'use strict';

module.exports = function(app) {

    // Home route
    var index = require('../controllers/index');

    app.route('/')
        .get(function(req, res){
            res.sendfile(__dirname + '/public/dist/index.html');
        });

};
