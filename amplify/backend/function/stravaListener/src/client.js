const https = require('https');
const AWS = require("aws-sdk");
const urlParse = require("url").URL;
const appsyncUrl = "https://yi7zd2l4ejcsnmqr6r2ib26aum.appsync-api.us-east-1.amazonaws.com/graphql" // process.env.API_TOURMAP_GRAPHQLAPIENDPOINTOUTPUT;
const region = 'us-east-1';
const endpoint = new urlParse(appsyncUrl).hostname.toString();
const apiKey = process.env.API_KEY;

const client = async (query, variables) => {
    const req = new AWS.HttpRequest(appsyncUrl, region);

    req.method = "POST";
    req.headers.host = endpoint;
    req.headers["Content-Type"] = "application/json";
    req.body = JSON.stringify({
        query: query,
        // operationName: "query",
        variables: variables
    });

    if (apiKey) {
        req.headers["x-api-key"] = apiKey;
    } else {
        const signer = new AWS.Signers.V4(req, "appsync", true);
        // console.log('signer', signer, AWS.config.credentials)
        signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
    }

    const data = await new Promise((resolve, reject) => {
        const httpRequest = https.request({ ...req, host: endpoint }, (result) => {
            result.on('data', (data) => {
                resolve(JSON.parse(data.toString()));
            });
        });

        httpRequest.write(req.body);
        httpRequest.end();
    });
    // console.log('client data', data)
    return data
};

module.exports = {
  client
}