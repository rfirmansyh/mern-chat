const User = require('./app/users/model');
const Message = require('./app/messages/model');
const Participant = require('./app/participants/model');

exports.socketApp = function(server) {
    const io = require('socket.io')(server);
    io.on('connection', function(socket) {
        console.log(socket.handshake.query.user_id);

        socket.on('joinRoom', ({chatroomId}) => {
            socket.join(chatroomId);
            console.log('A User joined chatroom: '+chatroomId);
        });

        socket.on('leaveRoom', ({chatroomId}) => {
            socket.leave(chatroomId);
            console.log('A User left chatroom: '+chatroomId);
        });

        socket.on('chatroomMessage', async ({chatroomId, message, user_id}) => {
            if (message.trim().length > 0) {
                const user = await User.findOne({ user_id: user_id });
                let newMessage = new Message({
                    message: message,
                    chatroom_id: chatroomId,
                    user_id: user_id,
                    user_name: user.name
                })
                await newMessage.save();   
                io.to(chatroomId).emit('newMessage', {
                    newMessage
                })
                socket.broadcast.emit('newOnContacMessage', {
                    newMessage
                })
                console.log(newMessage);
            }
        })

        socket.on('typing', async ({chatroomId, user_id}) => {
            const user = await User.findOne({ user_id: user_id });
            io.to(chatroomId).emit('user_typing', {
                chatroom_id: chatroomId,
                id: user_id,
                name: user.name
            })
        })

        // socket.on('chatroomMessage', async ({chatroomId, message}) => {
        //     if (message.trim().length > 0) {
        //         const user = await User.findOne({ user_id: socket.user_id });
        //         const newMessage = new Message({
        //             chatroom: chatroomId,
        //             user: socket.userId,
        //             message
        //         })
        //         io.to(chatroomId).emit('newMessage', {
        //             message,
        //             name: user.name,
        //             userId: socket.userId, 
        //         })
    
        //         await newMessage.save();
        //     }
        // });
    })
};