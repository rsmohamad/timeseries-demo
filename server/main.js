import {Meteor} from 'meteor/meteor';
import KalmanFilter from 'kalmanjs';
let kalman;

Meteor.startup(() => {
    let price = 0;

    Meteor.call('getLatestPrice', 'raw', (err, response)=> {
        price = response;
    });

    //Hack to give an initial price in case database is empty.
    if (!price) {
        price = 0;
    }

    kalmanInit();

    Meteor.setInterval(() => {
        Meteor.call('randomizePrice', 48, (err, response) => {
            if (!err) {
                price = response;
            } else {
                console.log(err.message);
            }

        });

        Meteor.call('insertPrice', price, "raw");
        Meteor.call('movingAverageFilter', 'raw');
        Meteor.call('iTrendFilter', 'raw');
        kalmanInsert(price);


    }, 1000);

});

function kalmanInit() {
    kalman = new KalmanFilter({R: 0.01, Q: 2});
    let document = StockData.findOne({type: 'raw'});
    let rawData = document.data;
    let data = [];

    for (i = 0; i < rawData.length; i++) {
        let push = {
            time: rawData[i].time,
            price: kalman.filter(rawData[i].price)
        };
        data.push(push);
    }

    StockData.update({type: 'kalman'}, {type: 'kalman', data}, {upsert: true});
}

function kalmanInsert(price) {
    price = kalman.filter(price);
    let type = "kalman";
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
        }
    );

    let document = StockData.findOne({type});
    if (document.data.length >= timeseriesCap) {
        for (let i = 0; i < document.data.length - timeseriesCap; i++)
            document.data.shift();
        StockData.update(document._id, document);
    }
}
