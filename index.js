const fs = require('fs');
const dotenv = require('dotenv');
const https = require('https');
dotenv.config();

const slackToken = process.env.SLACK_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID;
const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_USER_EMAIL;
const jiraToken = Buffer.from(email + ":" + apiToken).toString('base64');
const readyTasks = [];
const inProgressTasks = [];
const greetingsMessages = ['good morning! ', 'hello, ', 'greetings! ', 'morning! ', 'howdy. ', 'godmorgon. '];
const sprintMessage = ['Sprint is somewhat fine.', 'Sprint is okay.', 'Sprint is running smoothly.', 'Sprint is sprinting.'];
const workFromHomeExcuses = [
  // Pet-related
  "My cat isn’t feeling well, and I need to keep an eye on them throughout the day.",
  
  // Mental Health
  "I'm feeling mentally drained and would be more productive working from home in a quiet environment.",
  "I’ve been under some stress lately and could use the calm of working from home today.",
  "I didn’t sleep well and feel fatigued, so I’ll be more productive working from home.",
  "I’m experiencing a headache/migraine, but I’ll be able to work from home in a quieter environment.",
  "I'm feeling under the weather but can still work from home to avoid spreading anything.",
  
  // Unexpected Personal Errands
  "I have an unexpected errand at home, but I’ll still be working.",
  "I need to take care of some paperwork from home today.",
  
  // Family or Guests
  "A family member is visiting, and I need to be at home to accommodate them, but I’ll continue working.",
  
  // Home Repairs or Maintenance
  "I’m having emergency home repairs done today, and I need to be home to oversee it.",
  "There’s a scheduled maintenance at my place, so I’ll work remotely to manage it.",
  
  // Utilities or Service Providers
  "I’m waiting for the internet technician to fix an issue, and I need to be home for the appointment.",
  "I have a delivery scheduled today, and I need to be available to receive it.",
  
    // Appointments
  "I have a doctor's appointment scheduled, and it’s easier to work from home before/after the visit.",

  // Allergies and Sensitivities
  "My allergies are acting up, and I’m feeling a bit off, so I’ll be more comfortable working from home.",
  "I’m dealing with a mild allergic reaction and would prefer to work from home today.",
  "I’m recovering from a minor injury and need to take it easy, so I’ll work from home."
];'I will get to the office around 10. '

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
      inProgressTasks.push(task.fields.summary)
    } else if (task.fields.status.statusCategory.id == 2) {
      readyTasks.push(task.fields.summary)
    }
  })
}

exports.handler =  function(event, context, callback) {
  getTasks();
}


function buildMessage() {
    const random = Math.floor(Math.random() * greetingsMessages.length);
    const random2 = Math.floor(Math.random() * readyTasks.length);
    const taskMessage = inProgressTasks.length < 1 
                        ? 'I will start working on "' + readyTasks[0] + '". '
                         : 'I will continue to work on "' + inProgressTasks[0]  + '". '
    const message = greetingsMessages[random] + taskMessage + sprintMessage[Math.floor(Math.random() * sprintMessage.length)] + " " + buildWFHMessage();
    
    return message
}

function buildWFHMessage() {
  var today = new Date().toLocaleString('en-us', {  weekday: 'long' });
  if (today === 'Tuesday' || today === 'Thursday') {
    return workFromHomeExcuses[Math.floor(Math.random() * workFromHomeExcuses.length)]
  }
  return arrivalMessage;
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