/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiTourmapGraphQLAPIIdOutput = process.env.API_TOURMAP_GRAPHQLAPIIDOUTPUT
var apiTourmapGraphQLAPIEndpointOutput = process.env.API_TOURMAP_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
var { handleInput } = require("./graphql");

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/**********************
 * Example get method *
 **********************/

app.get("/strava/events", function(req, res) {
  if (req.query["hub.challenge"]) {
    console.log("Subscription setup: ", req.query);
    res.json({ "hub.challenge": req.query["hub.challenge"] });
  } else {
    res
      .status(500)
      .json({ error: "did not receive hub.challenge", url: req.url });
  }
});

app.get("/strava/events/*", function(req, res) {
  // Add your code here
  res.json({ success: "get call succeed!", url: req.url });
});

/****************************
 * Example post method *
 ****************************/

app.post("/strava/events", function(req, res) {
  console.log("New Strava Post event body", req.body);
  handleInput(req.body);
  res.status(200).end();
});

app.post("/strava/events/*", function(req, res) {
  // Add your code here
  res.status(404).end();
});

/****************************
 * Example put method *
 ****************************/

app.put("/strava/events", function(req, res) {
  // Add your code here
  res.status(404).end();
});

app.put("/strava/events/*", function(req, res) {
  // Add your code here
  res.status(404).end();
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/strava/events", function(req, res) {
  // Add your code here
  res.status(404).end();
});

app.delete("/strava/events/*", function(req, res) {
  // Add your code here
  res.status(404).end();
});

app.listen(3000, function() {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
