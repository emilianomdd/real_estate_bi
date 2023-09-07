const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const AvgCoinPriceSchema = new Schema({
    avg_price: [{
        date: Date,
        Price: Number
    }]
});


module.exports = mongoose.model('AvgCoinPrice', AvgCoinPriceSchema);