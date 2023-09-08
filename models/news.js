const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const NewsSchema = new Schema({
    news_num: Number,
    news: [{
        link: String,
        summary: String,
        category: String
    }]
});


module.exports = mongoose.model('News', NewsSchema);