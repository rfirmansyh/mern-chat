const User = require('../users/model');

async function getAllUsers(req, res) {
    let users = await User.find({});
    return res.json({
        data: users
    });
}

async function getAllUsersExcepts(req, res) {
    let except_user_ids = req.body.user_ids
    console.log(except_user_ids.map(v => v));
    let users = await User.find({
        user_id: {$nin: except_user_ids}
    })
    
    return res.json({
        users
    })
}

async function getAllUsersExceptsByUserId(req, res) {
    let user_id = parseInt(req.body.user_id);
    let except_contact_ids,
        users_current,
        users;
    
    users_current = await User.aggregate([
        {$match: {user_id: user_id}},
        {$lookup: {
            from: 'contacts',
            localField: 'user_owned_id',
            foreignField: 'user_id',
            as: 'contacts'
        }}
    ])

    try {
        except_contact_ids = await users_current[0].contacts.filter(contact => {
            if (contact.user_owned_id === user_id) {
                return true
            }
            return false
        }).map(v => v.user_saved_id)

        users = await User.find( {$and: [
            {user_id: {$ne: user_id}},
            {user_id: {$nin: except_contact_ids}}
        ]} )
        console.log(users);

    } catch(err) {
        console.log('User not found')
    }
    
    return res.json({
        users
    })
}

module.exports = {
    getAllUsersExceptsByUserId,
    getAllUsersExcepts,
    getAllUsers
}