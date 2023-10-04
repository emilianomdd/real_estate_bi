// emiliano@i-hexagon-401015.iam.gserviceaccount.com
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_KEY)
const { UserBindingPage } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const accountSid = process.env.TW_ID;
const authToken = process.env.TW_AUTH;
const Coin = require('../models/coin')
const avg_mkt_cap = require('../models/avg_market_cap')
const AvgCoinPrice = require('../models/avg_coin_price')
const Platform = require('../models/platform')
const Volume = require('../models/total_volumes')
// const async = require("async")
// const nodemailer = require('nodemailer')
// const crypto = require('crypto')
const XLSX = require('xlsx');
// var workbook = XLSX.readFile("controllers\\marketintelligennce_26_09_2023.xlsx")
const { cloudinary } = require("../cloudinary");
const AvgMktCap = require('../models/avg_market_cap');
const axios = require('axios')
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const OpenAI = require("openai");
const cheerio = require('cheerio')
const News = require('../models/news')
const fs = require('fs');
const Papa = require('papaparse');
const { google } = require('googleapis')
const { MongoClient } = require('mongodb');
const session = require('express-session');
const MongoDBStore = require("connect-mongo")(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports.zipSegSum = async (req, res) => {
    console.log('zipSegSum');

    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        console.log(rows)
        const reqd_zips = req.query.zip
        if (rows.length) {
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {
                if (index === 0) return;

                if (reqd_zips.includes(row['Postal Code'])) {
                    data = {
                        closing_date: row['Close Date'],
                        postal_code: row['Postal Code'],
                        closing_price: row['Close Price']
                    }
                    closing_data.push(data);
                } else {
                    data = {
                        closing_date: row['Close Date'],
                        closing_price: 0
                    }
                }
                if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
            });

            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));
            let closingDates = closing_data.map(property => new Date(property.closing_date));

            let startDate = closingDates[0];
            let endDate = closingDates[closingDates.length - 1];

            let segments = [];
            let sums = [];

            while (startDate <= endDate) {
                let segmentEnd = new Date(startDate);
                segmentEnd.setDate(segmentEnd.getDate() + 15);

                let sum = closing_data
                    .filter(property => new Date(property.closing_date) >= startDate && new Date(property.closing_date) < segmentEnd)
                    .reduce((acc, property) => acc + parseFloat(property.closing_price), 0);

                segments.push(startDate);
                sums.push(sum);

                startDate = segmentEnd;
            }

            console.log("Segments:", segments);
            console.log("Sums:", sums);
            const name = `Value Summation of Homes Sold Every 15 Days in: ${reqd_zips}`;
            res.render('users/render_sum', { segments, sums, name, zips });
        }


    } catch (e) {
        console.log(e); // Handle error during JWT client creation and API call
    }
}


module.exports.renderSegSum = async (req, res) => {
    console.log('renderSegSum');
    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        console.log(rows)
        if (rows.length) {
            // Your logic goes here...
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {
                if (index === 0) return;
                const data = {
                    closing_date: row['Close Date'],
                    postal_code: row['Postal Code'],
                    closing_price: row['Close Price']
                }
                if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
                closing_data.push(data);
            });
            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));

            let closingDates = closing_data.map(property => new Date(property.closing_date));
            let startDate = closingDates[0];
            let endDate = closingDates[closingDates.length - 1];
            let segments = [];
            let sums = [];

            while (startDate <= endDate) {
                let segmentEnd = new Date(startDate);
                segmentEnd.setDate(segmentEnd.getDate() + 15);

                let sum = closing_data
                    .filter(property => new Date(property.closing_date) >= startDate && new Date(property.closing_date) < segmentEnd)
                    .reduce((acc, property) => acc + parseFloat(property.closing_price), 0);

                segments.push(startDate);
                sums.push(sum);

                startDate = segmentEnd;
            }

            console.log("Segments:", segments);
            console.log("Sums:", sums);
            console.log(zips)
            const name = 'Value Summation of 1M+ Homes Closed Every 15 Days';
            res.render('users/render_sum', { segments, sums, name, zips });
        }

    } catch (e) {
        console.log(e);
    }
}

module.exports.renderZipPrices = async (req, res) => {
    console.log('renderZipPrices');
    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        console.log(rows)
        const reqd_zips = req.query.zip
        if (rows.length) {
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {
                if (index === 0) return;

                if (reqd_zips.includes(row['Postal Code'])) {
                    let existingEntry = closing_data.find(entry => entry.closing_date === row['Close Date']);
                    if (existingEntry) {
                        existingEntry.closing_price += parseFloat(row['Close Price']);
                    } else {
                        let data = {
                            closing_date: row['Close Date'],
                            postal_code: row['Postal Code'],
                            closing_price: parseFloat(row['Close Price'])
                        }
                        closing_data.push(data);
                    }
                } else {
                    let data = {
                        closing_date: row['Close Date'],
                        closing_price: 0
                    }
                    closing_data.push(data);
                }
                if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
            });

            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));
            const closing_date = [];
            const closing_price = [];
            closing_data.forEach(property => {
                closing_price.push(property.closing_price);
                closing_date.push(property.closing_date);
            });

            console.log(closing_data);
            console.log(closing_price);
            console.log(closing_date);
            const name = `Total Daily Sales Volume of Homes 1M+  in the Following Zip Codes: ${reqd_zips}`;
            res.render('users/dates_prices', { closing_date, closing_price, name, zips });
        }
    } catch (e) {
        console.log(e);
    }

};

module.exports.printCSV = async (req, res) => {
    console.log('printCSV');
    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        console.log(rows)
        if (rows.length) {
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {

                let existingEntry = closing_data.find(entry => entry.closing_date === row['Close Date']);
                if (existingEntry) {
                    existingEntry.closing_price += parseFloat(row['Close Price']);
                } else {
                    let data = {
                        closing_date: row['Close Date'],
                        postal_code: row['Postal Code'],
                        closing_price: parseFloat(row['Close Price'])
                    };
                    closing_data.push(data);
                } if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
            });
            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));
            const closing_date = [];
            const closing_price = [];
            closing_data.forEach(property => {
                closing_price.push(property.closing_price);
                closing_date.push(property.closing_date);
            });
            console.log(closing_data)
            const name = 'Total Daily Sales Volume of Closed Homes 1M+';
            res.render('users/dates_prices', { closing_date, closing_price, name, zips });
        }

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
};


module.exports.renderCount = async (req, res) => {
    console.log('renderCount')
    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        console.log(rows)
        if (rows.length) {
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {
                if (index === 0) return;
                data = {
                    closing_date: row['Close Date'],
                    postal_code: row['Postal Code'],
                    closing_price: row['Close Price']
                }
                if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
                closing_data.push(data)
            });
            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));
            let closingDates = closing_data.map(property => new Date(property.closing_date));

            let startDate = closingDates[0];
            let endDate = closingDates[closingDates.length - 1];

            let segments = [];
            let counts = [];

            while (startDate <= endDate) {
                let segmentEnd = new Date(startDate);
                segmentEnd.setDate(segmentEnd.getDate() + 15);
                let count = closingDates.filter(date => date >= startDate && date < segmentEnd).length;

                segments.push(startDate);
                counts.push(count);

                startDate = segmentEnd;
            }

            console.log("Segments:", segments);
            console.log("Counts:", counts);
            const name = 'Homes Over 1M+ Closed Every 15 Days'
            res.render('users/render_count', { segments, counts, name, zips })
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports.renderZipCount = async (req, res) => {
    console.log('renderZipCount')
    await client.connect();
    // Select the database
    const db = client.db('Real_Estate');

    // Select the collection
    const collection = db.collection('BI');
    console.log(collection)
    // Perform a query 

    try {

        console.log('preRows')
        const rows = await collection.find().toArray();
        const reqd_zips = req.query.zip
        console.log(reqd_zips)
        if (rows.length) {
            const closing_data = [];
            var zips = [];

            rows.forEach((row, index) => {
                if (index === 0) return;

                if (reqd_zips.includes(row['Postal Code'])) {
                    let data = {
                        closing_date: row['Close Date'],
                        postal_code: row['Postal Code'],
                        closing_price: row['Close Price']
                    }

                    closing_data.push(data)
                } else {
                    let data = {
                        closing_date: row['Close Date'],
                        closing_price: 0
                    }
                    closing_data.push(data);
                }
                if (!zips.includes(row['Postal Code'])) {
                    zips.push(row['Postal Code']);
                }
            });
            closing_data.sort((a, b) => new Date(a.closing_date) - new Date(b.closing_date));
            let closingDates = closing_data.map(property => new Date(property.closing_date));

            let startDate = closingDates[0];
            let endDate = closingDates[closingDates.length - 1];

            let segments = [];
            let counts = [];

            while (startDate <= endDate) {
                let segmentEnd = new Date(startDate);
                segmentEnd.setDate(segmentEnd.getDate() + 15);

                let count = closingDates.filter(date => date >= startDate && date < segmentEnd).length;

                segments.push(startDate);
                counts.push(count);

                startDate = segmentEnd;
            }

            console.log("Segments:", segments);
            console.log("Counts:", counts);
            const name = `Number of Homes Over 1M+ Closed in: ${reqd_zips}`
            res.render('users/render_count', { segments, counts, name, zips })
        }
    } catch (e) {
        console.log(e)
    }

}


module.exports.renderBusiness = async (req, res) => {
    console.log('renderBusiness')
    const find_news = await News.find()
    const news = find_news[0]
    console.log(news)
    var each_new = []
    for (let one_new of news.news) {
        if (one_new.category = 'business' && one_new.link.includes('business')) {
            console.log(one_new.category)
            each_new.push(one_new)
        }

    }
    each_new = each_new.reverse()
    console.log(each_new)
    res.render('users/business_news', { each_new })
}

module.exports.renderPolicy = async (req, res) => {
    console.log('renderPolicy')
    const find_news = await News.find()
    const news = find_news[0]
    var each_new = []
    for (let one_new of news.news) {
        if (one_new.category = 'policy' && one_new.link.includes('policy')) {
            each_new.push(one_new)
        }


    }
    each_new = each_new.reverse()
    console.log(each_new)
    res.render('users/policy_news', { each_new })
}

module.exports.summarizeCoins = async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY
    });
    const coins = await Coin.find()
    for (i = 0; i < coins.length; i++) {
        const prompt = `Write a short summary of the mechanics of the cryptocoin with the following tick mark: ${coins[i].name}`;
        const gpt4Response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": `${prompt}` }],
            max_tokens: 1000
        });
        coins[i].summary = gpt4Response.choices[0].message.content
        console.log(coins[i])
        await coins[i].save()

    }




}

module.exports.renderConsensus = async (req, res) => {
    console.log('renderConsensus')
    const find_news = await News.find()
    const news = find_news[0]
    var each_new = []
    for (let one_new of news.news) {
        if (one_new.link.includes('consensus')) {
            each_new.push(one_new)
        }


    }
    each_new = each_new.reverse()
    res.render('users/consensus_news', { each_new })
}

module.exports.renderMarkets = async (req, res) => {
    console.log('renderMarkets')
    const find_news = await News.find()
    const news = find_news[0]
    var each_new = []
    for (let one_new of news.news) {
        if (one_new.link.includes('markets') && one_new.category == 'markets') {
            each_new.push(one_new)
        }


    }
    each_new = each_new.reverse()
    res.render('users/market_news', { each_new })
}

module.exports.sacarDatos = async (req, res) => {
    try {
        // Make an HTTP request to the URL
        const response = await axios.get('https://coinmarketcap.com/rankings/exchanges/derivatives/');

        // Load the HTML content into Cheerio
        const $ = cheerio.load(response.data);

        // Define an array to store the table data
        const tableData = [];

        // Loop through each row of the table
        $('table tbody tr').each((index, row) => {
            const rowData = {};

            // Extract data from each cell in the row
            $(row).find('td').each((cellIndex, cell) => {
                console.log($(cell).text())
                switch (cellIndex) {
                    case 1: // Exchange Name
                        rowData.exchangeName = $(cell).find('.sc-1eb5slv-0 iQKAlx').text().trim();
                        break;
                    case 2: // Trading Volume
                        rowData.tradingVolume = $(cell).text().trim();
                        break;
                    case 3: // Open Interest
                        rowData.openInterest = $(cell).text().trim();
                        break;
                    default:
                        break;
                }
            });

            // Push the row data to the tableData array
            tableData.push(rowData);
        });

        console.log(tableData)

    } catch (error) {
        console.error('Error fetching table data:', error);
        return null;
    }
}




module.exports.sacarInfo = async (req, res) => {

    try {
        var all_links = []
        var good_links = []
        const response = await axios.get('https://www.coindesk.com/')
            .then(response => {
                const dom = new JSDOM(response.data);
                const document = dom.window.document;
                const links = Array.from(document.querySelectorAll('a'))
                    .map(a => a.href);
                all_links = links

            })
            .catch(error => {
                console.log('Error:', error);
            });
        for (let i = 0; i < all_links.length; i++) {
            const each_link = all_links[i]
            if (each_link.includes('author')) {
                if (!all_links[i - 1].includes('author')) {
                    good_links.push('https://www.coindesk.com' + all_links[i - 1])
                }
            }

        }

        const find_news = await News.find()
        const news = find_news[0]
        news.news_num = good_links.length
        var titles = []
        for (let each_new of news.news) {
            if (each_new.title !== 'undefined' && each_new.title !== '') {
                titles.push(each_new.title)
            }


        }

        console.log(titles)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_KEY
        });
        for (let link of good_links) {
            const parts = link.split('/');
            var category = ''
            if (parts.length > 3) {
                category = parts[3]; // Assuming the category is always the 4th element in the split array
            }
            const words = parts[parts.length - 2].split('-');
            const title = words.join(' ').replace('/', '')
            console.log(title)

            const articles = await axios.get(link)
            const $ = cheerio.load(articles.data)
            const articleText = $('p').map((i, el) => $(el).text()).get().join(' ');
            if (!titles.includes(title)) {
                // Use GPT - 4 to summarize
                const prompt = `Please summarize the following article: ${articleText}`;
                const gpt4Response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ "role": "user", "content": `${prompt}` }],
                    max_tokens: 900
                });

                news.news.push({
                    category: category,
                    link: link,
                    summary: gpt4Response.choices[0].message.content,
                    title: title
                })
                await news.save()
            }

        }
        res.render('home')
    } catch (e) {
        console.log(e)
        res.render('home')
    }
}

module.exports.renderNews = async (req, res) => {
    const all_news = await News.find()
    const news = all_news[0]
    const first_links = []
    const first_articles = []
    const first_titles = []
    const last_news = news.news.length - 1
    for (let i = 0; i < news.news_num; i++) {
        console.log(last_news - i)
        first_links.push(news.news[last_news - i].link)
        first_articles.push(news.news[last_news - i].summary)
        first_titles.push(news.news[last_news - i].title)
    }
    const links = first_links.reverse()
    const articles = first_articles.reverse()
    const titles = first_titles.reverse()

    res.render('users/news', { links, articles, titles })
}

module.exports.renderRegister = (req, res) => {

    res.render('users/register');
}


module.exports.renderVolume = async (req, res) => {
    const volumes = []
    const dates = []
    const name = req.query.coin
    const names = []
    const coin = await Coin.findOne({ name: name })
    for (let i = 0; i < coin.volume.length; i++) {
        volumes.push(coin.volume[i].volume)
        dates.push(coin.volume[i].date)
    }
    const coins = await Coin.find()
    for (i = 0; i < coins.length; i++) {

        names.push(coins[i].name)
    }

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    const summary = coin.summary
    res.render('users/coin_volume', { high, summary, low, summation, average, volumes, dates, name, names })
}
module.exports.renderMc = async (req, res) => {
    const mcs = []
    const dates = []
    const name = req.query.coin
    const names = []
    const coin = await Coin.findOne({ name: name })
    for (let i = 0; i < coin.market_cap.length; i++) {
        mcs.push(coin.market_cap[i].market_cap)
        dates.push(coin.market_cap[i].date)
    }
    const coins = await Coin.find()
    for (i = 0; i < coins.length; i++) {

        names.push(coins[i].name)
    }

    const high = Math.max(...mcs)
    const low = Math.min(...mcs)
    const summation = mcs.reduce((acc, val) => acc + val, 0)
    const average = summation / mcs.length
    const summary = coin.summary
    res.render('users/coin_mc', { high, low, summary, summation, average, mcs, dates, name, names })
}
module.exports.renderCs = async (req, res) => {
    const css = []
    const dates = []
    const name = req.query.coin
    const names = []
    const coin = await Coin.findOne({ name: name })
    for (let i = 0; i < coin.circulating_supply.length; i++) {
        css.push(coin.circulating_supply[i].circulating_supply)
        dates.push(coin.circulating_supply[i].date)
    }
    const coins = await Coin.find()
    for (i = 0; i < coins.length; i++) {

        names.push(coins[i].name)
    }

    const high = Math.max(...css)
    const low = Math.min(...css)
    const summation = css.reduce((acc, val) => acc + val, 0)
    const average = summation / css.length
    const summary = coin.summary
    res.render('users/coin_cs', { high, summary, low, average, css, dates, name, names })
}

module.exports.renderPlat = async (req, res) => {

    const name = req.query.platform
    console.log(req.body)
    console.log(req.query)
    console.log(req.params)
    const platform = await Platform.findOne({ name: name })
    const dates = []
    const volumes = []
    for (let i = 0; i < platform.spot.length; i++) {
        dates.push(platform.spot[i].date)
        volumes.push(platform.spot[i].volume)
    }
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/render_plat', { high, low, summation, average, platform, dates, volumes, names, name })
}

module.exports.renderWeekly = async (req, res) => {

    const name = req.query.platform
    const platform = await Platform.findOne({ name: name })
    const dates = []
    const visits = []
    for (let i = 0; i < platform.spot.length; i++) {
        dates.push(platform.spot[i].date)
        visits.push(platform.spot[i].weekly_visits)
    }
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }

    const high = Math.max(...visits)
    const low = Math.min(...visits)
    const summation = visits.reduce((acc, val) => acc + val, 0)
    const average = summation / visits.length
    res.render('users/render_weekly', { high, low, summation, average, platform, dates, visits, names, name })
}

module.exports.renderDer = async (req, res) => {

    const name = req.query.platform
    const platform = await Platform.findOne({ name: name })
    const dates = []
    const volumes = []
    for (let i = 0; i < platform.derivative.length; i++) {
        dates.push(platform.derivative[i].date)
        volumes.push(platform.derivative[i].volume)
    }
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }
    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/render_der', { high, low, summation, average, platform, dates, volumes, names, name })
}

module.exports.renderIntrest = async (req, res) => {

    const name = req.query.platform
    const platform = await Platform.findOne({ name: name })
    const dates = []
    const intrest = []
    for (let i = 0; i < platform.derivative.length; i++) {
        dates.push(platform.derivative[i].date)
        intrest.push(platform.derivative[i].open_intrest)
    }
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }
    const high = Math.max(...intrest)
    const low = Math.min(...intrest)
    const summation = intrest.reduce((acc, val) => acc + val, 0)
    const average = summation / intrest.length
    res.render('users/render_intrest', { high, low, summation, average, platform, dates, intrest, names, name })
}

module.exports.renderSpotVolume = async (req, res) => {
    const average_volume = await Volume.find()
    const volumes = []
    const dates = []
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }
    console.log(average_volume[0].spot)
    for (i = 0; i < average_volume[0].spot.length; i++) {

        volumes.push(average_volume[0].spot[i].volume)
        dates.push(average_volume[0].spot[i].date)
    }
    console.log(volumes)
    console.log(dates)
    console.log(names)

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/graphs_spot_volume', { high, low, summation, average, dates, volumes, names })
}

module.exports.renderDerVolume = async (req, res) => {
    const average_volume = await Volume.find()
    const volumes = []
    const dates = []
    const names = []
    const Plats = await Platform.find()
    for (let i = 0; i < Plats.length; i++) {
        names.push(Plats[i].name)
    }
    for (i = 0; i < average_volume[0].derivative.length; i++) {

        console.log(average_volume[0].derivative[i])
        volumes.push(average_volume[0].derivative[i].volume)
        dates.push(average_volume[0].derivative[i].date)
        console.log(average_volume[0].derivative[i].date)
    }

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/graphs_derivative_volume', { high, low, average, summation, dates, volumes, names })
}

module.exports.renderAvgPrice = async (req, res) => {
    const average_volume = await AvgCoinPrice.find()
    console.log(average_volume[0].avg_price)
    const all_coins = await Coin.find()
    const names = []
    for (i = 0; i < all_coins.length; i++) {
        names.push(all_coins[i].name)
    }
    const volumes = []
    const dates = []
    for (i = 0; i < average_volume[0].avg_price.length; i++) {

        console.log(average_volume[0].avg_price[i].Price)
        volumes.push(average_volume[0].avg_price[i].Price)
        dates.push(average_volume[0].avg_price[i].date)
        console.log(average_volume[0].avg_price[i].date)
    }

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/graphs_avg_price', { high, low, average, summation, dates, volumes, names })
}

module.exports.renderAvgMarket = async (req, res) => {
    const average_mkt_cap = await avg_mkt_cap.find()
    const all_coins = await Coin.find()
    const names = []
    for (i = 0; i < all_coins.length; i++) {
        names.push(all_coins[i].name)
    }
    const volumes = []
    const dates = []
    console.log(average_mkt_cap[0])
    for (i = 0; i < average_mkt_cap[0].avg_market_cap.length; i++) {

        console.log(average_mkt_cap[0].avg_market_cap[i].Price)
        volumes.push(average_mkt_cap[0].avg_market_cap[i].Price)
        dates.push(average_mkt_cap[0].avg_market_cap[i].date)
        console.log(average_mkt_cap[0].avg_market_cap[i].date)
    }
    console.log(names)

    const high = Math.max(...volumes)
    const low = Math.min(...volumes)
    const summation = volumes.reduce((acc, val) => acc + val, 0)
    const average = summation / volumes.length
    res.render('users/graphs_agv_mkt', { high, low, summation, average, dates, volumes, names })
}

module.exports.renderCoinsPrice = async (req, res) => {
    const coins = await Coin.find()
    const prices = []
    const names = []
    for (i = 0; i < coins.length; i++) {
        if (coins[i].name != 'BTC' && coins[i].name != 'WBTC') {
            prices.push(coins[i].price[coins[i].price.length - 1].price)
            names.push(coins[i].name)
        } else { continue }
    }
    console.log(prices)
    console.log(names)

    const high = Math.max(...prices)
    const low = Math.min(...prices)
    const summation = prices.reduce((acc, val) => acc + val, 0)
    const average = summation / prices.length
    res.render('users/graphs_coins_price', { high, low, average, prices, names })
}

module.exports.renderCoin = async (req, res) => {
    console.log('renderCoin')
    const prices = []
    const dates = []
    const name = req.query.coin
    const names = []
    const coin = await Coin.findOne({ name: name })
    for (let i = 0; i < coin.price.length; i++) {
        prices.push(coin.price[i].price)
        dates.push(coin.price[i].date)
    }
    const coins = await Coin.find()
    for (i = 0; i < coins.length; i++) {

        names.push(coins[i].name)
    }

    const high = Math.max(...prices)
    const low = Math.min(...prices)
    const summation = prices.reduce((acc, val) => acc + val, 0)
    const average = summation / prices.length
    const summary = coin.summary
    res.render('users/coin_price', { low, high, summary, average, prices, dates, name, names })
}

module.exports.populate_data = async (req, res) => {
    console.log('populate_data')

    var currentDate = new Date();
    var formattedDate = (currentDate.getMonth() + 1) + '/' + (currentDate.getDate()) + '/' + currentDate.getFullYear();
    console.log(formattedDate)
    let worksheet_coins = workbook.Sheets['By_Coin']
    let worksheet_spot = workbook.Sheets['Spot']
    let worksheet_derivatives = workbook.Sheets['Derivatives']
    const ids = []
    var index = 2

    while (worksheet_coins['B' + index]) {
        try {
            const str = worksheet_coins[`B${index}`].w
            const name = str.slice(0, str.indexOf(' '));
            const check_name = await Coin.findOne({ name: name })
            if (!check_name) {
                const coin = new Coin()
                coin.name = name
                const price = worksheet_coins[`C${index}`].v
                coin.price.push({ date: formattedDate, price: price })
                const mkt_cp = worksheet_coins[`G${index}`].v
                coin.market_cap.push({ date: formattedDate, market_cap: mkt_cp })
                const vol = worksheet_coins[`H${index}`].h
                const final_vol = Number(vol.replace(/[^0-9.]/g, ''))
                coin.volume.push({ date: formattedDate, volume: final_vol })
                const circ_sup = worksheet_coins[`I${index}`].h
                const final_circ_sup = Number(circ_sup.replace(/[^0-9.]/g, ''))
                coin.circulating_supply.push({ date: formattedDate, circulating_supply: final_circ_sup })

                await coin.save()

                ids.push(coin.id)
            }
            else {
                const price = worksheet_coins[`C${index}`].v
                check_name.price.push({ date: formattedDate, price: price })
                const mkt_cp = worksheet_coins[`G${index}`].v
                check_name.market_cap.push({ date: formattedDate, market_cap: mkt_cp })
                const vol = worksheet_coins[`H${index}`].h
                const final_vol = Number(vol.replace(/[^0-9.]/g, ''))
                check_name.volume.push({ date: formattedDate, volume: final_vol })
                const circ_sup = worksheet_coins[`I${index}`].h
                const final_circ_sup = Number(circ_sup.replace(/[^0-9.]/g, ''))
                check_name.circulating_supply.push({ date: formattedDate, circulating_supply: final_circ_sup })

                await check_name.save()

                ids.push(check_name.id)
            }
            index++
        } catch (e) {
            console.log(e)
            index++
            continue
        }

    }



    index = 2
    var ids_spot = []
    while (worksheet_spot['B' + index]) {
        try {
            const name = worksheet_spot[`B${index}`].v.replace("logo ", "")
            const check_plat = await Platform.findOne({ name: name })

            if (!check_plat) {
                const platform = new Platform()
                const spot = { volume: 0, weekly_visits: 0, date: formattedDate }
                platform.name = name
                const trading_vol = worksheet_spot[`D${index}`].v
                spot.volume = trading_vol
                const weekly_visits = worksheet_spot[`F${index}`].v
                spot.weekly_visits = weekly_visits
                platform.spot.push(spot)
                await platform.save()
                ids_spot.push(platform.id)
            } else {
                const spot = { volume: 0, weekly_visits: 0, date: formattedDate }
                const trading_vol = worksheet_spot[`D${index}`].v
                spot.volume = trading_vol
                const weekly_visits = worksheet_spot[`F${index}`].v
                spot.weekly_visits = weekly_visits
                check_plat.spot.push(spot)
                await check_plat.save()
                ids_spot.push(check_plat.id)
            }

            index++
        } catch (e) {
            index++
            continue
        }
    }

    var ids_derivatives = []
    index = 2
    var total_der = 0
    var total_intrest = 0
    while (worksheet_derivatives['B' + index]) {
        try {
            const name = worksheet_derivatives[`B${index}`].v.replace("logo ", "")
            const check_plat = await Platform.findOne({ name: name })
            if (!check_plat) {
                const platform = new Platform()
                const derivative = { volume: 0, open_intrest: 0, date: formattedDate }
                platform.name = name
                const trading_vol = worksheet_derivatives[`C${index}`].v
                derivative.volume = trading_vol
                var open_intrest = worksheet_derivatives[`F${index}`].v
                if (open_intrest == '--') {
                    open_intrest = 0
                }
                derivative.open_intrest = open_intrest
                platform.derivative.push(derivative)
                await platform.save()
                total_der += platform.derivative[platform.derivative.length - 1].volume
                total_intrest += platform.derivative[platform.derivative.length - 1].open_intrest

                ids_derivatives.push(platform.id)
            } else {
                const derivative = { volume: 0, open_intrest: 0, date: formattedDate }
                const trading_vol = worksheet_derivatives[`C${index}`].v
                derivative.volume = trading_vol
                var open_intrest = worksheet_derivatives[`F${index}`].v
                if (open_intrest == '--') {
                    open_intrest = 0
                }
                derivative.open_intrest = open_intrest
                check_plat.derivative.push(derivative)
                await check_plat.save()

                total_der += check_plat.derivative[check_plat.derivative.length - 1].volume
                total_intrest += check_plat.derivative[check_plat.derivative.length - 1].open_intrest

                ids_derivatives.push(check_plat.id)
            }

            index++
        } catch (e) {
            console.log(e)
            index++
            continue
        }
    }
    let sumMarketCap = 0;
    let sumCoinPrice = 0;
    for (let i = 0; i < ids.length; i++) {

        const coin = await Coin.findById(ids[i])
        try {
            if (coin.market_cap[coin.market_cap.length - 1].market_cap > 0) {
                sumMarketCap += coin.market_cap[coin.market_cap.length - 1].market_cap;
            } if (coin.price[coin.price.length - 1].price > 0) {
                sumCoinPrice += coin.price[coin.price.length - 1].price;
            } else { continue }
        } catch (e) {
            console.log(e)
            continue
        }
    }

    const averageMarketCap = sumMarketCap / ids.length;
    const averageCoinPrice = sumCoinPrice / ids.length;

    const mkcp = await AvgMktCap.find()
    const average_mkcp = mkcp[0]
    // const average_mkcp = new AvgMktCap()
    const prices = await AvgCoinPrice.find()
    const average_price = prices[0]
    // const average_price = new AvgCoinPrice()
    average_mkcp.avg_market_cap.push({ date: formattedDate, Price: averageMarketCap })
    await average_mkcp.save()
    average_price.avg_price.push({ date: formattedDate, Price: averageCoinPrice })
    await average_price.save()

    var sumSpotVol = 0
    var sumSpotWeekly = 0
    for (let i = 0; i < ids_spot.length; i++) {
        const platform = await Platform.findById(ids_spot[i])
        try {
            if (platform.spot[platform.spot.length - 1].volume > 0) {
                sumSpotVol += platform.spot[platform.spot.length - 1].volume;
            } else { continue }
        }
        catch (e) {
            continue
        }
        try {
            if (platform.spot[platform.spot.length - 1].weekly_visits > 0) {
                sumSpotWeekly += platform.spot[platform.spot.length - 1].weekly_visits
            } else { continue }
        } catch (e) {
            continue
        }
    }
    var sumDerVol = 0
    var opIntrest = 0
    for (let i = 0; i < ids_derivatives.length; i++) {
        const platform = await Platform.findById(ids_derivatives[i])
        try {
            sumDerVol += platform.derivative[platform.derivative.length - 1].volume;

        } catch (e) {
            console.log(e)
            continue
        }
        try {

            opIntrest += platform.derivative[platform.derivative.length - 1].open_intrest

        } catch (e) {
            console.log(e)
            continue
        }
    }
    const spot = {
        date: formattedDate,
        volume: sumSpotVol,
        weekly_visits: sumSpotWeekly
    }
    const derivative = {
        date: formattedDate,
        volume: sumDerVol,
        open_intrest: opIntrest
    }
    const volumes = await Volume.find()
    // const volume = new Volume()
    const volume = volumes[0]
    volume.spot.push(spot)
    volume.derivative.push(derivative)
    await volume.save()


}
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, phone, countryCode } = body;
        const cart = new Carrito();
        const user = new User({ email, username });
        const final_phone = (countryCode + phone).replace(/[^0-9]/g, '');
        user.phone = '+' + final_phone;
        user.cart = cart;
        user.date = Date.now();
        await cart.save();
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) throw err;
            req.flash('success', 'Welcome to Cargi!');
            res.redirect('/places');
        });
    } catch (err) {
        console.error(err);
        req.flash('error', err.message);
        res.redirect('/places');
    }
};

module.exports.renderAllPosts = async (req, res, next) => {

    const posts = await Post.find()
    console.log('renderAllPosts')
    res.render('users/render_posts', { posts })
}
//renders page to register a vendor in a specific place
module.exports.RenderVendor = async (req, res, next) => {
    try {
        const { id } = req.params
        const place = await Place.findById(id)
        res.render('users/register_vendor', { place })
    }
    catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/camoground')
    }
}

//registers the vendor in the system with stripe onboarding andliked to its proper place
module.exports.RegisterVendor = async (req, res, next) => {

    const { id } = req.params
    const place = await Place.findById(id)
    const { email } = req.body
    const account = await stripe.accounts.create({ type: 'express' });
    const accountLink = await stripe.accountLinks.create({

        account: account.id,
        refresh_url: 'https://cargi.herokuapp.com/places',
        return_url: 'https://cargi.herokuapp.com/places',
        type: 'account_onboarding'
    });

    try {
        const { username, password } = req.body;
        const user = new User({ email, username, password });
        user.places.push(place)
        user.store = true
        user.stripe_account = account.id
        user.is_vendor = true

        place.online_payments = true
        await place.save()
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Cargi!');
            res.redirect(accountLink.url);
        })
    } catch (e) {
        console.log(e)
        req.flash('error', e.message);
        res.redirect('/place');
    }

}


//show route to see your cuenta
module.exports.RenderCuenta = async (req, res) => {
    var all_posts = []
    if (!req.session.tab) {
        req.session.tab = []
    }
    var tab_price = 0
    for (let i = 0; i < req.session.tab.length; i++) {
        req.session.tab[i].posts = await Post.findById(req.session.tab[i].posts._id)
    }
    all_posts = req.session.tab
    for (let item of all_posts) {
        if (item.price) {
            tab_price += parseInt(item.price)
        } else {
            tab_price += parseInt(item.posts.price)
        }

    }
    const tab = req.session.tab
    if (tab.length > 0) {

        var place = await Place.findById(tab[0].posts.place)
        var online_payment = place.online_payments
        const cart_message = false
        const delete_message = false
        var price = 0
        for (let i = 0; i < tab.length; i++) {
            price += tab[i].price
        }
        console.log(tab)

        res.render('users/render_tab', { delete_message, price, cart_message, all_posts, place, tab_price, online_payment })
    } else {
        req.session.tab = []
        res.render('users/tab_no_items')
    }

}




//shelfed messaging function to create a message
module.exports.createMessage = async (req, res) => {
    const { id } = req.params;
    const to = id
    const to_user = await User.findById(id)
    const from = req.user.id
    var body = req.body.message.body
    const from_user = await User.findById(from)
    body = body + ` - ${from_user.username}`
    const message = new Message({ body, from, to })
    await message.save()
    to_user.messages.push(message.id)
    from_user.messages.push(message.id)
    await from_user.save()
    await to_user.save()
    const user_to = await User.findById(message.to)
    const user_from = await User.findById(message.from)
    const Current_user = await User.findById(req.user.id).populate({
        path: 'messages',
        populate: {
            path: 'to'
        }
    }).populate({
        path: 'messages',
        populate: {
            path: 'from'
        }
    });
    res.render('users/message-active', { message, user_to, user_from, Current_user })
}

//renders orders of final customers
module.exports.RenderMyOrders = async (req, res) => {
    console.log("RenderMyOrders")
    try {
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders',
            populate: {
                path: 'posts'
            }
        }).populate({
            path: 'orders',
            populate: {
                path: 'place'
            }
        })
        console.log(req.session.orders)
        const orders = req.session.orders
        const place = req.session.place
        console.log(orders)
        res.render('users/render_orders', { orders, place })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}


//renders incoming orders to a vendor
module.exports.RenderStoreOrders = async (req, res) => {
    console.log('RenderStoreOrders')
    try {
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders_to_complete'
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer'
                }
            }
        ).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'posts'
                }
            }
        ).populate('places')
        const place = user.places[0]
        const order_completed = 'q'
        console.log(user.orders_to_complete, 'OTC')
        res.render('users/render_vendor_orders', { user, place, order_completed })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}

//Renders incomoing orders on a specific location
module.exports.RenderSelect = async (req, res) => {
    console.log('RenderSelect')
    try {
        const section = req.query.section.trim()
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders_to_complete',
            populate: {
                path: 'posts',
            }
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')
        const place = user.places[0]
        const orders = user.orders_to_complete
        const all_posts = []
        for (let order of orders) {
            if (order.section == section) {
                all_posts.push(order)
            }
        }
        const order_completed = 'd'
        res.render('users/render_vendor_section', { user, place, section, all_posts, order_completed })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}


//Completes order
module.exports.completeOrder = async (req, res) => {
    console.log('completeOrder 251')
    try {
        const { id } = req.params
        const order = await Order.findById(id)
        console.log(order)
        order.is_delivered = true
        order.is_paid = true
        await order.save()
        console.log(order.is_paid)
        console.log(order.is_delivered)
        const user = await User.findById(req.user.id).populate('orders_to_complete').populate('places')

        const place = user.places[0]
        const order_completed = order
        res.render('users/render_vendor_orders', { user, place, order_completed })

    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}




module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/places';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/places');
}


//updates order status and sends a whatsapp message indicating that the order is 5 min away
module.exports.FiveMin = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).populate('customer')
        order.status = 'Su orden estara lista para recoger en 5 minutos'
        const user = await User.findById(req.user.id).populate({
            path: 'orders_to_complete',
            populate: {
                path: 'posts',
            }
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')

        client.messages
            .create({
                body: 'Su orden estara lista en 5 minutos',
                from: 'whatsapp:+14155238886',
                to: `whatsapp: +15129654086`
            })
            .done()
        await order.save()
        const place = user.places[0]

        const order_completed = 'q'
        res.render('users/render_vendor_orders', { user, place, order_completed })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}



//updates order status and sends a whatsapp message indicating that the order is ready
module.exports.Ready = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).populate('customer')
        const user = await User.findById(req.user.id).populate({
            path: 'orders_to_complete',
            populate: {
                path: 'posts',
            }
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')
        client.messages
            .create({
                body: 'Su orden esta lista para recoger',
                from: 'whatsapp:+14155238886',
                to: `whatsapp: +15129654086`
            })
            .done()
        order.status = 'Orden lista para recoger'
        await order.save()
        const place = user.places[0]
        const order_completed = 'q'
        res.render('users/render_vendor_orders', { user, place, order_completed })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}


module.exports.renderPDF = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders_to_complete'
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')
        const place = user.places[0]

        res.render('users/order_xlx', { user, place })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}

module.exports.renderReport = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders_to_complete'
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')
        const place = user.places[0]

        res.render('users/order_xlx', { user, place })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}

module.exports.RenderSelectXlx = async (req, res) => {
    try {
        const section = req.query.section.trim()
        const { id } = req.params
        const user = await User.findById(id).populate({
            path: 'orders_to_complete',
            populate: {
                path: 'posts',
            }
        }).populate(
            {
                path: 'orders_to_complete',
                populate: {
                    path: 'customer',
                }
            }
        ).populate('places')
        const place = user.places[0]
        const orders = user.orders_to_complete
        const all_posts = []
        console.log(orders.length)
        for (let order of orders) {
            if (order.section == section) {
                all_posts.push(order)
            }
        }
        console.log(all_posts)
        res.render('users/render_vendor_section_xlx', { user, place, section, all_posts })
    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')

    }
}

module.exports.RenderSelectConfirm = async (req, res) => {
    console.log('Render Select Confirm 496')
    console.log(req.query)
    try {
        const section = req.query.trim()
        const { id } = req.params
        const order = await Order.findById(id)
        const user = await User.findById(req.user.id).populate({
            path: 'orders_to_complete'
        }).populate(
            {
                path: 'orders_to_complete'
            }
        ).populate('places')
        order.is_delivered = true
        order.is_paid = true
        await order.save()
        const place = user.places[0]
        const order_completed = order
        const orders = user.orders_to_complete
        const all_posts = []
        for (let order of orders) {
            if (order.section == section) {
                all_posts.push(order)
            }
        }
        res.render('users/render_vendor_section', { all_posts, user, place, order_completed, section })

    } catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/place')
    }
}

module.exports.RenderStripe = async (req, res, next) => {
    console.log('hi')
    try {
        const { id } = req.params
        const place = await Place.findById(id)
        res.render('users/register_stripe.ejs', { place })
    }
    catch (e) {
        console.log(e)
        req.flash('Refresca la Pagina e Intenta de Nuevo')
        res.render('/camoground')
    }
}

//registers the vendor in the system with stripe onboarding andliked to its proper place
module.exports.RegisterStripe = async (req, res, next) => {

    const { id } = req.params
    const place = await Place.findById(id)
    const { email } = req.body
    const account = await stripe.accounts.create({ type: 'express' });
    const accountLink = await stripe.accountLinks.create({

        account: account.id,
        refresh_url: 'https://cargi.herokuapp.com/places',
        return_url: 'https://cargi.herokuapp.com/places',
        type: 'account_onboarding'
    });

    try {
        const user = req.user
        user.store = true
        user.stripe_account = account.id

        place.online_payments = true
        await place.save()
        user.is_vendor = true
        user.email = email
        res.redirect(accountLink.url);
    } catch (e) {
        console.log(e)
        req.flash('error', e.message);
        res.redirect('/place');
    }

}

module.exports.renderBulk = async (req, res) => {
    console.log('renderBulk')
    try {
        const { id } = req.params
        console.log(id)
        const order = await Order.findById(id)
        const mult_orders = []
        for (let bulk_order of order.multiple_orders) {
            mult_orders.push(await Order.findById(bulk_order).populate('posts'))
        }
        order.multiple_orders = mult_orders
        console.log(order)
        res.render('users/render_bulk', { order })
    } catch (e) {
        console.log(e)
        req.flash('error', e.message);
        res.redirect('/place');
    }
}

module.exports.renderTabs = async (req, res) => {
    const user = await User.findById(req.user.id)
    const tabs = []
    for (let tab of user.tabs) {
        tabs.push(await Tab.findById(tab))
    }
    console.log(tabs)
    res.render('users/tab/render_tabs', { tabs })
}

module.exports.renderSingleTab = async (req, res) => {
    const { id } = req.params
    const tab = await Tab.findById(id).populate({
        path: 'orders',
        populate: {
            path: 'posts'
        }
    })


    res.render('users/tab/render_tab_vendor', { tab })
}

module.exports.tabDelivered = async (req, res) => {
    console.log('tabDelivered')
    const { id } = req.params
    const tab = await Tab.findById(id)
    tab.paid = true
    tab.delivered = true
    await tab.save()
    const user = await User.findById(req.user.id)
    const tabs = []
    for (let tab of user.tabs) {
        tabs.push(await Tab.findById(tab))
    }
    res.render('users/tab/render_tabs', { tabs })
}
// module.exports.renderForgot = async (req, res) => {
//     res.render("users/forgot");
// };

// module.exports.renderReset = async (req, res) => {
//     res.render("users/reset");
// };

// module.exports.forgot = async (req, res, next) => {
//     try {
//         let algorithm = "aes-256-cbc";
//         let initVector = crypto.randomBytes(16);
//         let message = "This is a secret message";
//         let Securitykey = crypto.randomBytes(32);
//         let cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
//         let token = cipher.update(message, "utf-8", "hex");
//         token += cipher.final("hex");

//         let user = await User.findOne({ email: req.body.email });

//         if (!user) {
//             req.flash("error", "No account with that email address exists.");
//             return res.redirect("/forgot");
//         }
//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//         var t = await user.save();

//         var smtpTransport = nodemailer.createTransport({
//             service: "Gmail",
//             auth: {
//                 user: "admin@cargi.heroku.com",
//                 pass: process.env.GMAILPW,
//             },
//         });

//         var mailOptions = {
//             to: user.email,
//             from: "admin@cargi.heroku.com",
//             subject: "Node.js Password Reset",
//             text:
//                 "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
//                 "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
//                 "http://" +
//                 req.headers.host +
//                 "/reset/" +
//                 token +
//                 "\n\n" +
//                 "If you did not request this, please ignore this email and your password will remain unchanged.\n",
//         };

//         await smtpTransport.sendMail(mailOptions);

//         req.flash(
//             "success",
//             "An e-mail has been sent to " + user.email + " with further instructions."
//         );
//         res.redirect("/forgot");

//     } catch (error) {
//         if (error) return next(error);
//         res.redirect("/forgot");
//     }
// };

// module.exports.getToken = async (req, res) => {
//     const user = await User.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//         req.flash("error", "Password reset token is invalid or has expired.");
//         return res.redirect("/forgot");
//     } else {
//         res.render("users/reset", { token: req.params.token });
//     }
// };

// module.exports.postToken = async (req, res) => {
//     try {
//         if (req.params.token) {
//             let token = req.params.token;
//             if (!token) {
//                 req.flash("error", "Password reset token is invalid or has expired.");
//                 return res.redirect("back");
//             }
//             let user = await User.findOne({
//                 resetPasswordToken: token,
//                 resetPasswordExpires: { $gt: Date.now() },
//             });

//             if (!user) {
//                 req.flash("error", "Password reset token is invalid or has expired.");
//                 return res.redirect("back");
//             }

//             if (req.body.password === req.body.confirm) {
//                 async.waterfall(
//                     [
//                         function (done) {
//                             User.findOne(
//                                 {
//                                     resetPasswordToken: req.params.token,
//                                     resetPasswordExpires: { $gt: Date.now() },
//                                 },
//                                 function (err, user) {
//                                     if (!user) {
//                                         req.flash(
//                                             "error",
//                                             "Password reset token is invalid or has expired."
//                                         );
//                                         return res.redirect("back");
//                                     }
//                                     if (req.body.password === req.body.confirm) {
//                                         user.setPassword(req.body.password, function (err) {
//                                             user.resetPasswordToken = undefined;
//                                             user.resetPasswordExpires = undefined;

//                                             user.save(function (err) {
//                                                 req.logIn(user, function (err) {
//                                                     done(err, user);
//                                                 });
//                                             });
//                                         });
//                                     } else {
//                                         req.flash("error", "Passwords do not match.");
//                                         return res.redirect("back");
//                                     }
//                                 }
//                             );
//                         },
//                         function (user, done) {
//                             var smtpTransport = nodemailer.createTransport({
//                                 service: "Gmail",
//                                 auth: {
//                                     user: "emiliano.villarreal99@gmail.com",
//                                     pass: process.env.GMAILPW,
//                                 },
//                             });
//                             var mailOptions = {
//                                 to: user.email,
//                                 from: "emiliano.villarreal99@gmail.com",
//                                 subject: "Your password has been changed",
//                                 text:
//                                     "Hello,\n\n" +
//                                     "This is a confirmation that the password for your account " +
//                                     user.email +
//                                     " has just been changed.\n",
//                             };
//                             smtpTransport.sendMail(mailOptions, function (err) {
//                                 req.flash(
//                                     "success",
//                                     "Success! Your password has been changed."
//                                 );
//                                 done(err);
//                             });
//                         },
//                     ],
//                     function (err) {
//                         res.redirect("/places");
//                     }
//                 );
//             } else {
//                 req.flash("error", "Passwords do not match.");
//                 res.redirect(`/ reset / ${ token }`);
//             }
//         }
//     } catch (error) {
//         req.flash("error", "Something went wrong Please try again.");
//         res.redirect("/forgot");
//     }
// }