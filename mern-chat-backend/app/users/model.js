const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { model, Schema } = mongoose;

const HASH_ROUND = 10;

const userSchema = Schema({
    name : {
        type: String,
        required: [true, 'Nama harus diisi'],
        maxlength: [255, 'Panjang nama harus antara 3 - 255 karakter'],
        minlength: [3, 'Panjang nama harus antara 3 - 255 karakter']
    },
    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        maxlength: [255, 'Panjang email maksimal 255 karakter'],
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        maxlength: [255, 'Panjang password maksimal 255 karakter'],
    },
    token: [String]
}, { timestamps: true });

// email validate
userSchema.path('email').validate(async function(value) {
    try {
        const count = await this.model('User').count({email: value});
        return !count;
    } catch(err) {
        throw err;
    }
}, attr => `${attr.value} harus merupakan email yang valid!`);

userSchema.path('email').validate(function(value) {
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return EMAIL_RE.test(value);
}, attr => `${attr.value} harus merupakan email yang valid!`);

// password hashing
userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
})

// autoincrement column
userSchema.plugin(AutoIncrement, {inc_field: 'user_id'});


module.exports = model('User', userSchema);
