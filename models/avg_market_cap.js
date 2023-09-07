const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const AvgMarketCapSchema = new Schema({
    avg_market_cap: [{
        date: Date,
        Price: Number
    }],
});


module.exports = mongoose.model('AvgMktCap', AvgMarketCapSchema);