var AWS = require("aws-sdk");
var moment = require('moment-timezone');

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.run = function(event, context) {
  moment.tz.setDefault("Pacific/Auckland");
  var daysAgo = 0;
  console.log(daysAgo);
  var currentDate = moment(new Date()).startOf("day");
  var start = moment(currentDate).subtract(daysAgo, 'd').startOf("day").format('x');
  var end = moment(currentDate).subtract(daysAgo - 1, 'd').startOf("day").format('x');
  console.log("queryDateStart: " + start)
  console.log("queryDateEnd: " + end)
  var params = {
    TableName: "phoneGallery",
    ExpressionAttributeValues: {
      ":start": parseInt(start),
      ":end": parseInt(end)
    },
    ProjectionExpression: "#timestamp, phoneModel",
    FilterExpression: "#timestamp between :start and :end",
    ExpressionAttributeNames: {
      "#timestamp": "ctimestamp"
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
      var phoneModel = [];
      for (a = 0; a < dataLength; a++) {
        phoneModel.push(data[a].phoneModel)
      }
      //      console.log(phoneModel);

      let counted = []
      for (var c of phoneModel) {
        const alreadyCounted = counted.map(c => c.name)
        if (alreadyCounted.includes(c)) {
          counted[alreadyCounted.indexOf(c)].count += 1
        } else {
          counted.push({
            'name': c,
            'count': 1
          })
        }
      }
      // console.log(counted)
      counted.sort(function(a, b) {
          return parseFloat(b.count) - parseFloat(a.count) ;
      });

      context.done(null, counted);
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  }
}
