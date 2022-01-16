# PURPOSE:
My team requires us to write our plan for the day in slack  every morning around 9 o`clock and it is getting mildly annoying. So this bot is here to automate the task.


# TODO LIST: 

- [x] `Create a task json list`
- [x] `Acquire oauth token from slack`
- [x] Find out how to send messages to a slack channel as a user(- https://api.slack.com/methods/chat.postMessage). API doc etc 
- [x] Try to use slack scheduled message? idk if it is necessary though. 
- [ ] Fetch task list from Jira/Phabricator?.
- [ ] `Set up AWS Lambda.`

# BACKLOG:

1. Fetch task list from Jira.
2. ???
3. Profit

# PROBLEMS:
- Do i have to upload json file every week or even everyday?
- In order to get tasks form phabricator i need to create an Oauth server(which i don't have access for) or actually crawl the web(i don't know how to get past the 2fa).
(https://developer.atlassian.com/server/jira/platform/rest-apis/)