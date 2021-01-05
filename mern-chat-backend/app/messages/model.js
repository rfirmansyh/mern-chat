const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { model, Schema } = mongoose;


const messageSchema = new Schema({
    message : String,
    chatroom_id: Number,
    user_name : String,
    user_id: Number,
}, { timestamps: true });

// autoincrement column
messageSchema.plugin(AutoIncrement, {inc_field: 'messsage_id'});


module.exports = model('Message', messageSchema);
