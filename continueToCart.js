var AWS = require("aws-sdk");
var moment = require('moment-timezone');

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.run = function(event, context) {
  moment.tz.setDefault("Pacific/Auckland");
  var daysAgo = event.daysAgo;
  console.log(daysAgo);
  var currentDate = moment(new Date()).startOf("day");
  var start = moment(currentDate).subtract(daysAgo, 'd').startOf("day").format('x');
  var end = moment(currentDate).subtract(daysAgo - 1, 'd').startOf("day").format('x');
  console.log("queryDateStart: " + start);
  console.log("queryDateEnd: " + end)
  var params = {
    TableName: "addToCart",
    ExpressionAttributeValues: {
      ":start": parseInt(start),
      ":end": parseInt(end)
    },
    ProjectionExpression: "#timestamp, newExisting",
    FilterExpression: "#timestamp between :start and :end",
    ExpressionAttributeNames: {
      "#timestamp": "ctimestamp"
    }
  };
  // console.log(params)
  console.log("Scanning table....");
  docClient.scan(params, onScan);

  function onScan(err, data) {
    var currentDate = moment(new Date()).startOf("day");
    var start = moment(currentDate).subtract(daysAgo, 'd').startOf("day").format('x');
    var end = moment(currentDate).subtract(daysAgo - 1, 'd').startOf("day").format('x');
    if (err) {
      console.error("Unable to scan the table. Error JSON:", err);
    } else {
      console.log("Scan succeeded.");
      var data = data.Items
      var dataLength = data.length;
      var dateArray = [];
      for (i = 0; i < dataLength; i++) {
        var date = new Date(data[i].ctimestamp);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        var timestamp = date;
        var date = moment(date).tz("Pacific/Auckland").format('x');
        dateArray.push(date);
        var dataOutput = []
        var hourSearch = start;
        if (typeof data.LastEvaluatedKey != "undefined") {
          console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
      }
      console.log(dateArray);

      moment.tz.setDefault("Pacific/Auckland");
      var daysAgo = event.daysAgo;
      console.log(daysAgo);
      var currentDate = moment(new Date()).startOf("day");
      var start = moment(currentDate).subtract(daysAgo, 'd').startOf("day").format('x');
      var end = moment(currentDate).subtract(daysAgo - 1, 'd').startOf("day").format('x');
      var hourInspector = start;
      var arrayOutput = [];

      if(daysAgo == 0){
          var currentHour = moment(new Date()).tz("Pacific/Auckland").format('H')
          var hoursCurrently = parseInt(currentHour) - 2;
      }else {
        var hoursCurrently = 23
      }
      for (var i = 0; i <= hoursCurrently; i++) {
        if (hourInspector == start) {
          var count = dateArray.reduce(function(n, val) {
            return n + (val == hourInspector);
          }, 0);
          arrayOutput.push({date: hourInspector, hour: i, count: count});
          var hourInspector = parseInt(hourInspector) + 3600000
        } else {
          var hourInspector = parseInt(hourInspector) + 3600000
          var count = dateArray.reduce(function(n, val) {
            return n + (val == hourInspector);
          }, 0);
          arrayOutput.push({date: hourInspector, hour: i, count: count});
        }
      }
      context.done(null, {
        arrayOutput
      });
    }
  }
}

//
