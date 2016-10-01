/**
 * Created by dandi on 9/24/16.
 */
import {Template} from 'meteor/templating'
import {ReactiveVar} from 'meteor/reactive-var'
import {Tracker} from 'meteor/tracker'

let latestRaw = new ReactiveVar(0);
let latestMoving = new ReactiveVar(0);
let latestEhler = new ReactiveVar(0);
let latestKalman = new ReactiveVar(0);

let chart;
let rawData, movingAverage, iTrend, kalman;
let time;

Template.home.onCreated(() => {
    Meteor.subscribe("stockData.all");
});

Template.home.helpers({
    raw: () => {
        return latestRaw.get();
    },
    moving: () => {
        return latestMoving.get();
    },
    ehler: () => {
        return latestEhler.get();
    },
    kalman: () => {
        return latestKalman.get();
    },
});

Template.home.onRendered(() => {


    chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [],
            type: 'spline'
        },
        axis: {
            y: {
                label: {
                    text: "Voltage (V)",
                    position: "outer-bottom",
                    padding: {
                        right: 10
                    }
                },
            },
            x: {

                label: {
                    text: 'Time (s)',
                    position: "outer-right"
                }
            }
        },
        padding: {
            right: 50,
            left: 100,
            bottom: 50
        },
        size: {
            height: 480
        },
        point: {
            show: false
        },
        transition: {
            duration: 350
        }
    });

    Meteor.call('getStockData', 'raw', (err, response)=> {
        if (!err) {
            rawData = _.pluck(response, 'price');
            rawData.unshift('Raw');
            time = _.pluck(response, 'time');
            time.unshift('x');
            chart.load({
                columns: [
                    //time,
                    rawData
                ]
            });

        }
    });

    Meteor.call('getStockData', 'movingAverage', (err, response)=> {
        if (!err) {
            movingAverage = _.pluck(response, 'price');
            movingAverage.unshift('Moving Average');
            chart.load({
                columns: [
                    //time,
                    movingAverage
                ]
            });

        }
    });

    Meteor.call('getStockData', 'iTrend', (err, response)=> {
        if (!err) {
            iTrend = _.pluck(response, 'price');
            iTrend.unshift('Ehlers\' Trend');
            chart.load({
                columns: [
                    //time,
                    iTrend
                ]
            });

        }
    });

    Meteor.call('getStockData', 'kalman', (err, response)=> {
        if (!err) {
            kalman = _.pluck(response, 'price');
            kalman.unshift('Kalman');
            chart.load({
                columns: [
                    //time,
                    kalman
                ]
            });

        }
    });



    Meteor.setInterval(() => {
        Meteor.call('getLatestPrice', 'raw', (error, response)=> {
            if (!error) {
                rawData = [response];
                rawData.unshift('Raw');
                latestRaw.set(response.toFixed(2));
            } else {
                console.log(error.message);
            }
        });

        Meteor.call('getLatestPrice', 'movingAverage', (error, response)=> {
            if (!error) {
                movingAverage = [response];
                movingAverage.unshift('Moving Average');
                latestMoving.set(response.toFixed(2));
            } else {
                console.log(error.message);
            }
        });

        Meteor.call('getLatestPrice', 'iTrend', (error, response)=> {
            if (!error) {
                iTrend = [response];
                iTrend.unshift('Ehlers\' Trend');
                latestEhler.set(response.toFixed(2));
            } else {
                console.log(error.message);
            }
        });

        Meteor.call('getLatestPrice', 'kalman', (error, response)=> {
            if (!error) {
                kalman = [response];
                kalman.unshift('Kalman');
                latestKalman.set(response.toFixed(2));
            } else {
                console.log(error.message);
            }
        });


        chart.flow({
            columns: [
                rawData,
                movingAverage,
                iTrend,
                kalman
            ]
        });


    }, 1000);

});

Tracker.autorun(() => {
});