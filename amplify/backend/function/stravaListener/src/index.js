const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const { handleInput } = require('./graphql')

const server = awsServerlessExpress.createServer(app);

exports.handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log(`CONTEXT: ${JSON.stringify(context)}`)
  const serverPromise = awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
  
  if (event.httpMethod == "POST" && event.body) {
    let body = JSON.parse(event.body)
    await handleInput(body)
  }
  
  return serverPromise;
};
