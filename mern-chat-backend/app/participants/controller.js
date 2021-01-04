const Participant = require('../participants/model');

async function store(req, res) {
    const payload = req.body;
    let participant = new Participant(payload);
    await participant.save();
    
    return res.json({
        data: participant
    });
}

// GET PARTICIPANT BY PARTICIPANT USER ID
async function getParticpantsByPUid(req, res) {
    const user_id = parseInt(req.body.user_id);
    let participants = await Participant.find({user_id: user_id});
    return res.json({
        req: user_id,
        data: participants
    })
}

// GET PARTICIPANT BY PARTICIPANT CHATROOM ID
async function getAllDetailParticpantsByCUid(req, res) {
    const chatroom_id = parseInt(req.body.chatroom_id);
    let participants = await Participant.aggregate([
        {$match: {chatroom_id: chatroom_id}},
        {$lookup: {
            from: 'chatrooms',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'chatroom_detail'
        }},
        {$lookup: {
            from: 'participants',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'participants'
        }},
        {$lookup: {
            from: 'users',
            localField: 'participants.chatroom_id',
            foreignField: 'chatroom_id',
            as: 'users'
        }},
        {$lookup: {
            from: 'messages',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'messages'
        }},
        {$project: {participants: 0}}
    ]);
    return res.json({
        req_chatroom_id: chatroom_id,
        participants
    });
}


// GET ALL DETAIL DATA BY USER ID
async function getAllDetailParticipantsByUid(req, res) {
    const user_id = parseInt(req.body.user_id);
    let participants = await Participant.aggregate([
        {$match: {user_id: user_id}},
        {$lookup: {
            from: 'chatrooms',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'chatroom_detail'
        }},
        {$lookup: {
            from: 'participants',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'participants'
        }},
        {$lookup: {
            from: 'users',
            localField: 'participants.user_id',
            foreignField: 'user_id',
            as: 'users'
        }},
        {$lookup: {
            from: 'messages',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'messages'
        }},
        {$project: {participants: 0}}
    ]);
    return res.json({
        req_user_id: user_id,
        participants
    });
}



module.exports = {
    getAllDetailParticpantsByCUid,
    getAllDetailParticipantsByUid,
    getParticpantsByPUid,
    store,
}