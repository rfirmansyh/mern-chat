const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { model, Schema } = mongoose;


const chatroomSchema = new Schema({
    name : String,
    room_type: {
        type: String,
        enum : ['1','2'],
        default: '1'
    },
}, { timestamps: true });

// autoincrement column
chatroomSchema.plugin(AutoIncrement, {inc_field: 'chatroom_id'});


module.exports = model('Chatroom', chatroomSchema);
