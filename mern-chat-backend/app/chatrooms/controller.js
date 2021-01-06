const Chatroom = require('../chatrooms/model');

async function store(req, res) {
    const payload = req.body;
    let chatroom = new Chatroom(payload);
    await chatroom.save();
    
    return res.json({
        data: chatroom
    });
}

// GET CHAT ROOMS BY PARTICIPANT CHATROOMS ID
async function getChatroomsByPCid(req, res) {
    const chatroom_id = req.body.chatroom_id;
    let chatrooms = await Chatroom.find({chatroom_id: chatroom_id});
    res.json({
        data: chatrooms
    })
}

async function deleteAll(req, res) {
    Chatroom.deleteMany({}, function(err) {
        if(err) console.log(err);
        return res.json({
            data: 'Chatroom deleted'
        })
    });
    
}

module.exports = {
    store,
    getChatroomsByPCid,
    deleteAll
}