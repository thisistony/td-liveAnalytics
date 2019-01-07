var AWS = require("aws-sdk");
var moment = require('moment-timezone');

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.run = function(event, context) {
  var params = {
    TableName: "conversions",
    ProjectionExpression: "#timestamp, newExisting",
    FilterExpression: "#timestamp > :start_tc",
    ExpressionAttributeNames: {
      "#timestamp": "ctimestamp",
    },
    ExpressionAttributeValues: {
      ":start_tc": 0
    }
  };

  console.log("Scanning table....");
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", err);
    } else {
      console.log("Scan succeeded.");
      var data = data.Items
      var dataLength = data.length;
      var dateArray = [];
      for(i=0; i<dataLength; i++){
          var date = new Date(data[i].ctimestamp);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          var date = moment(date).tz("Pacific/Auckland").format("DD/MM/YY");
          dateArray.push({"date" : date});
      }
      let dataOutput = dateArray.reduce((dateArray, obj) => {
        let bool = false;
        if (!dateArray) {
          dateArray = [];
        }
        dateArray.forEach((a) => {
          if (a.date === obj.date) {
            a.count++;
            bool = true;
          }
        });
        if (!bool) {
          obj.count = 1;
          dateArray.push(obj);
        }
        return dateArray;
      }, []);
      dataOutput.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      console.log(dataOutput);
      context.done (null, dataOutput);
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  }
}
