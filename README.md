# Intercom Webhook
A custom Hasura service that acts as an Intercom Webhook.
The project allows one to create a very basic static keyword - response type bot.
The frontend interface has an editable table that one can use to add the keyword - response pairs.
Testing the bot is easily done with the Intercom chat app on the bottom right section of the screen.


Hasura hub: https://hasura.io/hub/project/omnicron/intercom-webhook

## Guide

#### Add your cluster to the project
`hasura cluster add <cluster-name> <alias>` (Not required if cloned through `hasura quickstart`)


#### Set your cluster to be default
`hasura cluster set-default <alias>` (Not required if cloned through `hasura quickstart`)


#### Set cluster name
To deploy the project in your own cluster, all you need to do is set the proper cluster name value in the `ui` microservice to that of yours.
- Replace the cluster name in `microservices/ui/app/src/components/Config.js`
- Replace the cluster name in `microservices/ui/app/package.json`, in the `start` and `build` keys of the `scripts` object.



#### Deploy
When done, deploy the code to your cluster using `git push <alias> master`.


## Customizing
The project contains two microservices, `ui` for the frontend, in *ReactJS* and `api` for the backend in *NodeJS*.
#### Frontend
The frontend is completely built using custom components, while using `react-router` for SPA redirection and `react-motion` for transition animations.
Every major component is written within a separate file to making them easier to reuse and manage. The style for each such component is also available as `ui/app/src/components/css/<Component>.css`, where `Component` is the filename of the corresponding React component.


#### Backend
Most of the backend code is present in the `microservices/api/src/server.js` file.

The REST API involves the following endpoints:
- `/intercom` (GET): A dummy endpoint to test if the server is working.
- `/intercom_webhook` (POST): Processes and replies to webhook notifications from Intercom. This is where the app generated replies to the user are dispatched from.
- `/add_entries` (POST): Accepts JSON object with the format `{ data: [Object] }`, where `data` is an array of objects of type `{ key: <string>, message: <string> }`. Keys are case-insensitive. This submitted data is stored in the database which can then be used in the Intercom bot.
- `/get_value` (GET): Endpoint to test the return message for a given *key*. The format for the request could look like `https://api.cluster-name.hasura-app.io/get_value?key=hello`.
