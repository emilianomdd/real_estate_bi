const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const PlatformSchema = new Schema({
    name: String,
    spot: [{
        date: Date,
        volume: Number,
        weekly_visits: Number
    }], derivative: [{
        date: Date,
        volume: Number,
        open_intrest: Number
    }]
});


module.exports = mongoose.model('Platform', PlatformSchema)