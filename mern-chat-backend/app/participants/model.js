const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { model, Schema } = mongoose;


const participantSchema = new Schema({
    chatroom_id : Number,
    user_id: Number
}, { timestamps: true });

// autoincrement column
participantSchema.plugin(AutoIncrement, {inc_field: 'participant_id'});


module.exports = model('Participant', participantSchema);
