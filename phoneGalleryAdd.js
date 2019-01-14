var AWS = require('aws-sdk'),
  dynamodb = new AWS.DynamoDB({
    region: 'eu-west-1'
  }),
  docClient = new AWS.DynamoDB.DocumentClient({
    service: dynamodb
  })

var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function insertTable(event, context) {
  var date = new Date();
  var timestamp = date.getTime();
  console.log("Performing injection...")
  var table = "phoneGallery";
  var params = {
    TableName: "phoneGallery",
    Item: {
      "ctimestamp": Number(timestamp),
      "phoneModel": String(event.phoneModel),
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
