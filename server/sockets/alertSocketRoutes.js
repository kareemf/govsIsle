var _ = require('lodash'),
    socketIo = require('socket.io'),
    mongoose = require('mongoose'),
    Alert = mongoose.model('Alert'),
    permissionsManager = require('../controllers/permissionsManager')(Alert);

module.exports = function(server){
    var io = socketIo.listen(server);

    var num_connections = 0;
    var previous_data = []; //TODO: cache via redis
    var socketId_user_map = {};

    var ascertainPermissions = function(socket, doc){
        var permissions = permissionsManager.ascertainBasicPermissions(doc);
        var user = socketId_user_map[socket.id];

        if(user){
            permissions = permissionsManager.ascertainPermissions(user, doc);
        }

        return permissions;
    };

    var stripDoc = function(doc, permissions){
        var _doc = doc.toObject();
        //remove all field for which the user does not have read access
        _doc = permissionsManager.removeNonPermitedFields(permissions, _doc);
        return _doc;
    };

    var filterDocs = function(socket, docs){
        var _docs = [];
        docs.forEach(function(doc){
            var permissions = ascertainPermissions(socket, doc);

            if(!doc.published && !_.contains(permissions, Alert.readUnpublishedPermission())){
                console.log('user cant view unpublished Alert', doc);
                return;
            }

            var _doc = stripDoc(doc, permissions);  
            _docs.push(_doc);          
        });
        return _docs;
    };

    //TODO: enddate >= today
    var stream = Alert.find().tailable().stream();

    stream.on('data', function (doc) {
        //note: there may be as few a 0 users connected at this point, meaning that noone may see this initial data
        //hence, it is stored in previousData, so that it will be accessible to all who join later
        console.log('Alert stream doc', doc, 'num_connections emitting to:', num_connections);

        for(var socket in io.sockets.connected){
            var permissions = ascertainPermissions(socket, doc);

            //prevent user from viewing unpublished content unless they have permission to do so
            //see baseController.get for more details
            if(!doc.published && !_.contains(permissions, Alert.readUnpublishedPermission())){
                console.log('user cant view unpublished Alert', doc);
                continue;
            }

            var _doc = stripDoc(doc, permissions);            
            io.sockets.connected[socket.id].emit('alert', _doc);
        }

        previous_data.push(doc);
    });

    stream.on('error', function (err) {
        console.error('Alert stream error', err);
    });

    stream.on('close', function () {
        console.log('Alert stream closed');
    });

    io.sockets.on('connection', function(socket) {
        console.log('user connected to socket. num_connections:', ++num_connections);

        //connecting user may have missed out on all previous transmissions, get them up to speed
        console.log('previous_data count:', previous_data.length);
       
        socket.on('authenicated_connection', function(user){
            console.log('user', user._id, 'connected to socket', socket.id);
            socketId_user_map[socket.id] = user;

            var _docs = filterDocs(socket, previous_data);            

            console.log('sending', _docs.length, 'out of', previous_data.length,' items to socket', socket.id);
            io.sockets.connected[socket.id].emit('alerts', _docs);
        });

        socket.on('anonymous_connection', function(){
            console.log('anonymous connection to socket', socket.id);

            var _docs = filterDocs(socket, previous_data);            

            console.log('sending', _docs.length, 'out of', previous_data.length,' items to socket', socket.id);
            io.sockets.connected[socket.id].emit('alerts', _docs);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected. num_connections', --num_connections);
            delete socketId_user_map[socket.id];
        });
    });
};
