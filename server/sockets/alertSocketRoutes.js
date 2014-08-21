var socketIo = require('socket.io'),
    mongoose = require('mongoose'),
    Alert = mongoose.model('Alert');

module.exports = function(server){
    var io = socketIo.listen(server);

    var num_connections = 0;
    var previous_data = []; //TODO: cache via redis

    //TODO: only published (unless admin),
    //TODO: enddate >= today
    //TODO: published == true
    var stream = Alert.find().tailable().stream();

    stream.on('data', function (doc) {
        //note: there may be as few a 0 users connected at this point, meaning that noone may see this initial data
        //hence, it is stored in previousData, so that it will be accessible to all who join later
        console.log('Alert stream doc', doc, 'num_connections emitting to:', num_connections);

        io.emit('alert', doc);
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
        io.sockets.socket(socket.id).emit('alerts', previous_data);

        socket.on('disconnect', function(){
            console.log('user disconnected. num_connections', --num_connections);
        });
    });
};
