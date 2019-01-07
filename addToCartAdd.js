var AWS = require('aws-sdk'),
  dynamodb = new AWS.DynamoDB({
    region: 'ap-southeast-2'
  }),
  docClient = new AWS.DynamoDB.DocumentClient({
    service: dynamodb
  }),
  q = require('q')

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function insertTable(event, context) {
  var dateInjection = JSON.stringify(event.daysAgo);
  console.log(dateInjection);
  var date = new Date();
  var timestamp = date.getTime();
  console.log("Performing injection...")
  var table = "addToCart";
  var params = {
    TableName: "addToCart",
    Item: {
      "ctimestamp": Number(timestamp),
      "value": Number("1")
    }
  };

  console.log("Adding a new item...");
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item!");
    }
  });
}
