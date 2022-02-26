const fs = require('fs');
const dotenv = require('dotenv');
const https = require('https');
const readyTasks = [];
const inProgressTasks = [];
const greetingsMessages = ['Good morning! ', 'Hello, ', 'Greetings! ', 'Morning! '];

dotenv.config();

const slackToken = process.env.SLACK_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID;
const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_USER_EMAIL;
const jiraToken = Buffer.from(email + ":" + apiToken).toString('base64');

console.log('Starting...');

function getTasks() {
    var options = {
        hostname: 'boozt.atlassian.net',
        path: '/rest/api/2/search?jql=assignee=61927ce4744c4d006936cda3',
        method: 'GET',
        port: 443,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + jiraToken,
        }
      };
    
      var req = https.request(options, (res) => {
        if (res.statusCode != 200) {
          console.log('ERROR');
        }
        console.log('statusCode:', res.statusCode);
        var body = [];
        res.on('data', (d) => {
          body.push(d);
        });

        res.on('end', function() {
            try {
                body = JSON.parse(Buffer.concat(body).toString());
            } catch(e) {
                console.log(e);
            }
            parseTasks(body);
            sendMessage();
            console.log(inProgressTasks);
            console.log(readyTasks);
        });

      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      
      req.end();
}

function parseTasks(data) {
  data.issues.forEach(task => {
    if (task.fields.status.statusCategory.id == 4 &&
      task.fields.status.name == 'In Progress') {
      console.log(task.fields.status);
      inProgressTasks.push(task.fields.summary)
    } else if (task.fields.status.statusCategory.id == 2) {
      readyTasks.push(task.fields.summary)
    }
  })
}

getTasks();

function buildMessage() {
    const random = Math.floor(Math.random() * greetingsMessages.length);
    const random2 = Math.floor(Math.random() * readyTasks.length);
    const taskMessage = inProgressTasks.length < 1 
                        ? 'I will start working on "' + readyTasks[0] + '".'
                         : 'I will continue to work on "' + inProgressTasks[0]  + '".'
    const message = greetingsMessages[random] + taskMessage
    
    return message
}

function sendMessage() {
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
}