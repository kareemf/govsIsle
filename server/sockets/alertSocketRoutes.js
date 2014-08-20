var socketIo = require('socket.io'),
    mongoose = require('mongoose'),
    Alert = mongoose.model('Alert');

module.exports = function(server){
    var io = socketIo.listen(server);

    io.sockets.on('connection', function(socket) {
        console.log('user connected to socket', socket.id);

        var stream = Alert.find().tailable().stream();

        stream.on('data', function (doc) {
            console.log('Alert stream doc', doc);
            io.emit('alert', doc);
        });

        stream.on('error', function (err) {
            console.error('Alert stream error', err);
        });

        stream.on('close', function () {
            console.log('Alert stream closed');
        });
    });
};
