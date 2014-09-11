'use strict';

module.exports = function(app) {

    // Home route
    var config = require('../config/config');

    app.route('/')
        .get(function(req, res){
            //res.sendfile(__dirname + '/public/index.html');
            if(config.useConcatendatedFiles){
                return res.render('index-dist');
            }
            res.render('index');


        });

};
