timeseriesCap = 50;
const dataRange = 10

import timeseries from 'timeseries-analysis'


Meteor.methods({
    'getTime': ()=> {
        let time = Date.now();
        return time;
    },

    'insertPrice': (price, type) => {
        let data = {price: price, time: new Date()};
        StockData.update(
            {type},
            {
                $push: {
                    data
                }
            },
            {
                upsert: true
            });

        let document = StockData.findOne({type});
        if (document.data.length >= timeseriesCap) {
            for (let i = 0; i < document.data.length - timeseriesCap; i++)
                document.data.shift();
            StockData.update(document._id, document);
        }
        //console.log(price);
    },

    'getLatestPrice': (type) => {
        let document = StockData.findOne({type});
        let latest = document.data[document.data.length - 1].price;
        //console.log(latest);
        return latest;
    },

    'randomizePrice': (price) => {
        return Math.abs(price + Math.floor(Math.random() * dataRange) - dataRange / 2);
    },

    'getStockData': (type)=> {
        let document = StockData.findOne(({type}));
        return document.data;
    },

    'movingAverageFilter': () => {
        let document = StockData.findOne({type: 'raw'});
        let rawData = new timeseries.main(timeseries.adapter.fromDB(document.data, {
            date: 'time',
            value: 'price'
        }));
        //console.log(rawData);
        let filtered = rawData.ma({period: 10});
        let data = [];
        //console.log(filtered.data.length);
        for (i = 0; i < filtered.data.length; i++) {
            let push = {
                time: filtered.data[i][0],
                price: filtered.data[i][1]
            };
            data.push(push);
        }

        StockData.update({type: 'movingAverage'}, {type: 'movingAverage', data}, {upsert: true});
    },

    'wipeDB': () => {
        StockData.remove({});
    },

    'smoother': ()=> {
        let document = StockData.findOne({type: 'raw'});
        let rawData = new timeseries.main(timeseries.adapter.fromDB(document.data, {
            date: 'time',
            value: 'price'
        }));
        //console.log(rawData);
        let filtered = rawData.smoother({period: 100});
        let data = [];
        //console.log(filtered.data.length);
        for (i = 0; i < filtered.data.length; i++) {
            let push = {
                time: filtered.data[i][0],
                price: filtered.data[i][1]
            };
            data.push(push);
        }

        StockData.update({type: 'smoother'}, {type: 'smoother', data}, {upsert: true});
    },

    'iTrendFilter': ()=> {
        let document = StockData.findOne({type: 'raw'});
        let rawData = new timeseries.main(timeseries.adapter.fromDB(document.data, {
            date: 'time',
            value: 'price'
        }));
        let filtered = rawData.dsp_itrend({alpha: 0.3});
        let data = [];
        for (i = 0; i < filtered.data.length; i++) {
            let push = {
                time: filtered.data[i][0],
                price: filtered.data[i][1]
            };
            data.push(push);
        }
        StockData.update({type: 'iTrend'}, {type: 'iTrend', data}, {upsert: true});
    },


});