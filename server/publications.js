/**
 * Created by dandi on 9/24/16.
 */


Meteor.publish("stockData.all", () => {
    return StockData.find();
});
