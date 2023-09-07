const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    is_vendor: Boolean,
    is_manager: Boolean,
    is_cartero: Boolean,
    date: Date,
    store: Boolean,
    stripe_account: String,
    phone: String,
    email: { type: String, unique: true, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    email: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: { type: Boolean, default: false }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);