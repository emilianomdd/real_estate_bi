const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const CoinSchema = new Schema({
    name: String,
    price: [{
        date: Date,
        price: Number
    }],
    circulating_supply: [{
        date: Date,
        circulating_supply: Number
    }],
    volume: [{
        date: Date,
        volume: Number
    }],
    market_cap: [{
        date: Date,
        market_cap: Number
    }],
    summary: String
});


module.exports = mongoose.model('Coin', CoinSchema);