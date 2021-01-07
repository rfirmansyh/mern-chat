const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { model, Schema } = mongoose;


const contactSchema = new Schema({
    name: String,
    user_owned_id : Number,
    user_saved_id: Number,
    chatroom_id: Number,
}, { timestamps: true });

// autoincrement column
contactSchema.plugin(AutoIncrement, {inc_field: 'contact_id'});

module.exports = model('Contact', contactSchema);