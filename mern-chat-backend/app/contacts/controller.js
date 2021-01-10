const Contact = require('../contacts/model');
const Participant = require('../participants/model');
const Chatroom = require('../chatrooms/model');


async function getContactsByUserId(req, res) {
    const user_id = parseInt(req.body.user_id);
    let contacts = await Contact.aggregate([
        {$match: {user_owned_id: user_id}},
        {$lookup: {
            from: 'users',
            localField: 'user_owned_id',
            foreignField: 'user_id',
            as: 'user_owner_detail'
        }},
        {$lookup: {
            from: 'users',
            localField: 'user_saved_id',
            foreignField: 'user_id',
            as: 'user_saved_detail'
        }},
        {$unwind: { path: '$user_owner_detail', }},
        {$unwind: { path: '$user_saved_detail', }},
    ]);
    return res.json({
        contacts
    });
}

async function getInContactByUserId(req, res) {
    const user_id = parseInt(req.body.user_id);
    const user_saved_id = parseInt(req.body.user_saved_id);
    let contact = await Contact.aggregate([
        {$match: {user_owned_id: user_id}},
        {$match: {user_saved_id: user_saved_id}},
        {$lookup: {
            from: 'users',
            localField: 'user_owned_id',
            foreignField: 'user_id',
            as: 'user_owner_detail'
        }},
        {$lookup: {
            from: 'users',
            localField: 'user_saved_id',
            foreignField: 'user_id',
            as: 'user_saved_detail'
        }},
        {$unwind: { path: '$user_owner_detail', }},
        {$unwind: { path: '$user_saved_detail', }},
    ]);
    return res.json({
        contact: contact[0]
    });
}

async function store(req, res) {
    const payload = req.body;
    let participant = [],
        contact_check = [],
    user_saved_id = parseInt(payload.user_saved_id);
    user_owned_id = parseInt(payload.user_owned_id);
    try {
        contact_check = await Contact.find({
            $or: [
                {$and: [
                    {user_saved_id: user_saved_id},
                    {user_owned_id: user_owned_id},
                ]},
                {$and: [
                    {user_saved_id: user_owned_id},
                    {user_owned_id: user_saved_id},
                ]},
            ]
        })

        if (contact_check.length !== 0) {
            participant = await Participant.aggregate([
                {$lookup: {
                    from: 'chatrooms',
                    localField: 'chatroom_id',
                    foreignField: 'chatroom_id',
                    as: 'chatroom_detail'
                }},
                {$lookup: {
                    from: 'users',
                    localField: 'participants.user_id',
                    foreignField: 'user_id',
                    as: 'users'
                }},
                {$match: {
                    chatroom_id: contact_check[0].chatroom_id
                }},
                {$project: {participants: 0}}
            ]);
        } 

        if (participant.length === 0) {
            await (async() => {
                let new_chatroom = new Chatroom({
                    name: `c_uid_${user_owned_id}_${user_saved_id}`,
                    type: '1'
                });
                new_chatroom = await new_chatroom.save();
                payload['chatroom_id'] = await new_chatroom.chatroom_id;
            })();
        } else {
            payload['chatroom_id'] = await participant[0].chatroom_id;
        }
    } catch(err) {
        console.log('error store contacts');
    }
    let contact = new Contact(payload);
    await contact.save();

    return res.json({
        contact,
    });
}



async function deleteAll(req, res) {
    Contact.deleteMany({}, function(err) {
        if(err) console.log(err);
        return res.json({
            data: 'Contact deleted'
        })
    });
    
}


module.exports = {
    getInContactByUserId,
    getContactsByUserId,
    store,
    deleteAll
}