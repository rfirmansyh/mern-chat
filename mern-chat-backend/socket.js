const User = require('./app/users/model');
const Message = require('./app/messages/model');

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
                const newMessage = new Message({
                    message: message,
                    chatroom_id: chatroomId,
                    user_id: user_id
                })
                await newMessage.save();   
                io.to(chatroomId).emit('newMessage', {
                    newMessage
                })
                console.log(newMessage);
            }
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