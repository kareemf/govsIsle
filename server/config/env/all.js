'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	hostname: process.env.HOST || process.env.HOSTNAME,
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI,
    redis: process.env.REDISCLOUD_URL || "redis://127.0.0.1:6379/0",
	templateEngine: 'swig',
	useConcatendatedFiles:  process.env.USE_CONCATENDATED || false,
	writeAccessLog:  process.env.WRITE_LOG || false,
	accessLogLevel: process.env.LOG_LEVEL || 'combined', //dev, combined, common, short, or tiny
	accessLogPath: process.env.LOG_PATH || rootPath + '/access.log',

    // The secret should be set to a non-guessable string that
    // is used to compute a session hash
    sessionSecret: 'MEAN',
    // The name of the MongoDB collection to store sessions in
    sessionCollection: 'sessions'
};
