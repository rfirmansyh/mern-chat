const Contact = require('../contacts/model');


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

async function store(req, res) {
    const payload = req.body;
    let contact = new Contact(payload);
    await contact.save();

    return res.json({
        data: contact
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
    getContactsByUserId,
    store,
    deleteAll
}