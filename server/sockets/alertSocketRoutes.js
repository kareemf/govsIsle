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

    //TODO: only published (unless admin),
    //TODO: enddate >= today
    //TODO: published == true
    var stream = Alert.find().tailable().stream();

    stream.on('data', function (doc) {
        //note: there may be as few a 0 users connected at this point, meaning that noone may see this initial data
        //hence, it is stored in previousData, so that it will be accessible to all who join later
        console.log('Alert stream doc', doc, 'num_connections emitting to:', num_connections);

        for(var socket in io.sockets.connected){
            var permissions = permissionsManager.ascertainBasicPermissions(doc);
            var user = socketId_user_map[socket.id];
            
            if(user){
                permissions = permissionsManager.ascertainPermissions(user, doc);
            }

            //prevent user from viewing unpublished content unless they have permission to do so
            //see baseController.get for more details
            if(!_.contains(permissions, Alert.readUnpublishedPermission())){
                console.log('user cant view unpublished Alert', doc);
                continue;
            }

            //remove all field for which the user does not have read access
            _doc = permissionsManager.removeNonPermitedFields(permissions, _doc);


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
        console.log('user connected to socket. num_connections', ++num_connections);

        //connecting user may have missed out on all previous transmissions, get them up to speed
        console.log('sending', previous_data.length, 'items to socket', socket.id);
        io.sockets.connected[socket.id].emit('alerts', previous_data);

        socket.on('authenicated_connection', function(user){
            console.log('user', user.id, 'connected to socket', socket.id);
            socketId_user_map[socket.id] = user;
        });

        socket.on('disconnect', function(){
            console.log('user disconnected. num_connections', --num_connections);
            delete socketId_user_map[socket.id];
        });
    });
};
