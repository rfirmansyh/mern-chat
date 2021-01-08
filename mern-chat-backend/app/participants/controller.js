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
            from: 'contacts',
            localField: 'user_id',
            foreignField: 'user_owned_id',
            as: 'contacts'
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
        {$sort: {'messages.createdAt': -1}},
        {$project: {participants: 0}}
    ]);
    return res.json({
        req_user_id: user_id,
        participants
    });
}

// GET ALL DETAIL DATA BY USER ID AND CONTACT ID
function checkParticipant(chatroom_id, user_owned_id, user_saved_id) {
    return Participant.aggregate([
        {$match: {chatroom_id: parseInt(chatroom_id)}},
        {$lookup: {
            from: 'chatrooms',
            localField: 'chatroom_id',
            foreignField: 'chatroom_id',
            as: 'chatroom_detail'
        }},
        {$lookup: {
            from: 'contacts',
            localField: 'user_id',
            foreignField: 'user_owned_id',
            as: 'contacts'
        }},
        {$match: {
            'contacts' : {$elemMatch: {
                user_saved_id: parseInt(user_saved_id), user_owned_id: parseInt(user_owned_id),
            }}
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
}
async function getAllDetailParticipantByUidAndContactId(req, res) {
    const chatroom_id = parseInt(req.body.chatroom_id);
    const user_owned_id = parseInt(req.body.user_owned_id);
    const user_saved_id = parseInt(req.body.user_saved_id);
    let participant = await checkParticipant(chatroom_id, user_owned_id, user_saved_id);;
    try {
        if (participant.length === 0) {
            console.log('0 ?')
            await (async() => {
                let participant1 = new Participant({
                    chatroom_id: chatroom_id,
                    user_id: user_owned_id,
                });
                let participant2 = new Participant({
                    chatroom_id: chatroom_id,
                    user_id: user_saved_id,
                });
                await participant1.save();
                await participant2.save();
            })();
        }
    } catch(err) {
        console.log('error')
    }

    participant = await checkParticipant(chatroom_id, user_owned_id, user_saved_id);

    return res.json({
        req_user_id: user_saved_id,
        participant
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
    getAllDetailParticipantByUidAndContactId,
    getAllDetailParticipantsByUid,
    getUsersParticipantByUid,
    getParticpantsByPUid,
    store,
    deleteAll
}