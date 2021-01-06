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

// GET USER LIST BY PARTICIPANT USER ID
async function getUsersParticipantByUid(req, res) {
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
        {$unwind: {
            path: '$chatroom_detail',
        }},
        {$match: {
            "chatroom_detail.room_type": "1"
        }},
        {$lookup: {
            from: 'users',
            localField: 'participants.user_id',
            foreignField: 'user_id',
            as: 'users'
        }},
        {$group: {
            _id: '$user_id',
            users: {
                $addToSet: '$users'
            }
        }},
        {$unwind: {
            path: '$users',
        }},
        {$unwind: {
            path: '$users',
        }},
        {$match: {
            'users.user_id': {$ne: user_id}
        }},
        {$group: {
            _id: '$_id',
            users: {
              $addToSet: '$users'
            }
        }},
    ]);
    return res.json({
        req_user_id: user_id,
        participants
    });
}

async function deleteAll(req, res) {
    Participant.deleteMany({}, function(err) {
        if(err) console.log(err);
        return res.json({
            data: 'Participants deleted'
        })
    });
    
}


module.exports = {
    getAllDetailParticipantsByUid,
    getUsersParticipantByUid,
    getParticpantsByPUid,
    store,
    deleteAll
}