const Message = require('../messages/model');

async function getAllMessage(req, res) {
    let messages = await Message.find({});
    return res.json({
        data: messages
    });
}

async function store(req, res) {
    const payload = req.body;
    let message = new Message(payload);
    await message.save();

    return res.json({
        data: message
    });
}

module.exports = {
    getAllMessage,
    store
}