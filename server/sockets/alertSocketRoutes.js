var _ = require('lodash'),
    redis = require('redis'),
    socketIo = require('socket.io'),
    mongoose = require('mongoose'),
    Alert = mongoose.model('Alert'),
    permissionsManager = require('../controllers/permissionsManager')(Alert);

module.exports = function(server){
    var io = socketIo.listen(server);
    var redisPubSubClient = redis.createClient();
    var redisKeyStoreClient = redis.createClient();

    var num_connections = 0;
    var socketId_user_map = {};

    var ascertainPermissions = function(socketId, doc){
        var permissions = permissionsManager.ascertainBasicPermissions(doc);
        var user = socketId_user_map[socketId];

        if(user){
            permissions = permissionsManager.ascertainPermissions(user, doc);
        }

        return permissions;
    };

    var stripDoc = function(doc, permissions){
        //remove all field for which the user does not have read access
        var _doc;
        if(doc.toObject){
            //convert mongoose model to POJO
            _doc = doc.toObject();
        }
        else{
            //if doc is already a POJO, create a copy
            _doc = _.extend({}, doc);
        }
        _doc = permissionsManager.removeNonPermitedFields(permissions, _doc);
        return _doc;
    };

    var filterDocs = function(socketId, docs){
        //remove the docs that user does not have permission to view
        //for remaining docs, remove fields that user does not have permission to view
        var _docs = [];
        docs.forEach(function(doc){
            var permissions = ascertainPermissions(socketId, doc);

            if(!doc.published && !_.contains(permissions, Alert.readUnpublishedPermission())){
                console.log('socket', socketId, 'user cant view unpublished Alert', doc._id);
                return;
            }

            var _doc = stripDoc(doc, permissions);  
            _docs.push(_doc);          
        });
        return _docs;
    };

    var getRedisItems = function(key, callback){
        redisKeyStoreClient.lrange(key, 0, -1, function(err, items){
            if(err){
                console.error('error retrieving', key, 'from redis. error', err);
                if(callback){
                    callback(err);
                }
            }
            else{
                console.log('key', key, 'retrieved', items.length,'from redis');
                if(callback){
                    callback(err, items);
                }
            }
        });
    };

    var handleSocketConnection = function(socket){
        //connecting user may have missed out on all previous transmissions, get them up to speed -
        //retrieve all previously emitted messages from redis and send to user
        getRedisItems('alerts',function(err, items){
            if(!err){
                var _docs = filterDocs(socket.id, items);

                console.log('sending', _docs.length, 'out of', items.length,' items to socket', socket.id);
                io.sockets.connected[socket.id].emit('alerts', _docs);
            }
        });
    };

    var emitToAllSockets = function(doc, channel) {
        if (!channel) {
            channel = 'alert';
        }
        for (var socketId in io.sockets.connected) {
            var permissions = ascertainPermissions(socketId, doc);

            //prevent user from viewing unpublished content unless they have permission to do so
            //see baseController.get for more details
            if (!doc.published && !_.contains(permissions, Alert.readUnpublishedPermission())) {
                console.log('socket', socketId, 'user cant view unpublished Alert', doc._id);
                continue;
            }

            var _doc = stripDoc(doc, permissions);
            console.log('emitting doc', doc._id, 'to socket', socketId, 'on channel', channel);
            io.sockets.connected[socketId].emit(channel, _doc);
        }
    };

    io.sockets.on('connection', function(socket) {
        console.log('connection to socket', socket.id, '. num_connections:', ++num_connections);

        socket.on('authenicated_connection', function(user){
            console.log('user', user._id, 'connected to socket', socket.id);
            socketId_user_map[socket.id] = user;
            handleSocketConnection(socket);
        });

        socket.on('anonymous_connection', function(){
            console.log('anonymous connection to socket', socket.id);
            handleSocketConnection(socket);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected. num_connections', --num_connections);
            delete socketId_user_map[socket.id];
        });
    });

    //TODO: enddate >= today
    var stream = Alert.find().stream();

    //clear cache on startups
    redisKeyStoreClient.del('alerts');

    stream.on('data', function (doc) {
        //note: there may be as few a 0 users connected at this point, meaning that noone may see this initial data
        //hence, it is stored in redis, so that it will be accessible to all who join later
        console.log('Alert stream doc', doc._id, 'num_connections emitting to:', num_connections);

        emitToAllSockets(doc);

        redisKeyStoreClient.rpush('alerts', JSON.stringify(doc));
    });

    stream.on('error', function (err) {
        console.error('Alert stream error', err);
    });

    stream.on('close', function () {
        console.log('Alert stream closed');
    });

    redisPubSubClient.on('pmessage', function(pattern, channel, message){
        //ex[expecting message to be the result of JSON.stringify(doc), doc being a mongoose model
        //expecting channel to be of the formar 'alerts.created', 'alerts.updated', etc
        console.log('redis - pattern', pattern, 'recieved message', message, 'on channel', channel);

        var type = channel.split('.')[1];
        var _doc = JSON.parse(message);

        emitToAllSockets(_doc, channel);

        if(type == 'created'){
            console.log('created redis alert', _doc._id);

            redisKeyStoreClient.rpush('alerts', message);
        }
        else if(type == 'updated'){
            getRedisItems('alerts', function(err, items){
                if(err){
                    return err;
                }
                items.forEach(function(item){
                    if( _doc._id != item._id){
                        return;
                    }
                    item = _doc;
                });

                console.log('updated redis alert', _doc._id);
                redisKeyStoreClient.set('alerts', items);
            });
        }
        else if(type == 'deleted'){
            getRedisItems('alerts', function(err, items){
                if(err){
                   return err;
                }
                var _docs = items.filter(function(item){
                    return _doc._id != item._id;
                });

                redisKeyStoreClient.set('alerts', _docs);
            });
        }
    });

    redisPubSubClient.on('psubscribe', function(pattern, count){
        console.log('redis subscribed to pattern',pattern, 'count', count);
    });

    redisPubSubClient.on("error", function (err) {
        console.error("redisPubSubClient error " + err);
    });

    redisKeyStoreClient.on("error", function (err) {
        console.error("redisKeyStoreClient error " + err);
    });

    redisPubSubClient.psubscribe('alert.*');
};
