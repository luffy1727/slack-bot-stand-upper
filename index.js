const fs = require('fs');
const dotenv = require('dotenv');
const https = require('https');
const taskData = require('./data/tasks.json');
const greetingsMessages = ['Good morning! ', 'Hello, ', 'Greetings! ', 'Morning! '];

dotenv.config();

const slackToken = process.env.SLACK_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID;

console.log('Starting...');

function buildMessage() {
    const random = Math.floor(Math.random() * greetingsMessages.length);
    const taskMessage = taskData['in-progress'].length < 1 
                        ? 'I haven`t decided what to work on today, but I am alive and well.' +
                        ' I will decide what to work on, once i get to work.' : 'I will continue to work on ' + taskData['in-progress'][0].name
    const message = greetingsMessages[random] + taskMessage
    
    return message
}

var postData = JSON.stringify({
    'channel' : slackChannel,
    'text' : buildMessage(),
});

var options = {
    hostname: 'slack.com',
    path: '/api/chat.postMessage',
    method: 'POST',
    port: 443,
    headers: {
         'Content-Type': 'application/json',
         'Content-Length': postData.length,
         'Authorization': 'Bearer ' + slackToken,
       }
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  
  req.on('error', (e) => {
    console.error(e);
  });
  
  req.write(postData);
  req.end();