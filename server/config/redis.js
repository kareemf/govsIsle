'use strict';

var redis = require('redis'),
    url = require('url'),
    config = require('./config');

var redisURL = url.parse(config.redis);

/*wrapper for redis.createClient which takes care of connection and authentication information*/
exports.createClient = function(){
    console.log('connecting to redis:', config.redis);

    var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
    if(redisURL.auth){
        client.auth(redisURL.auth.split(":")[1]);
    }


    return client;
};
