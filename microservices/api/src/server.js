var express = require('express');
var app = express();
var request = require('request');
var router = express.Router();
var morgan = require('morgan');
var bodyParser = require('body-parser');
require('request-debug')(request);

var fetch  = require('node-fetch');
var util = require('util');

var hasuraExamplesRouter = require('./hasuraExamples');
var projectConfig = require('./config');
var server = require('http').Server(app);

router.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', hasuraExamplesRouter);
app.get("/intercom", function (req, res)
{
    console.log("GET from intercom\n");
    console.log(req.body); // populated!

    console.log("Data : \n")
    console.log(req.body.data);

    res.send("OK");
});

const HASURA_CONFIG = {
    urls: {
        data: "https://data." + projectConfig.cluster + ".hasura-app.io/v1/query"
    },
    token: {
        admin: "8a620887b334de0ecce79da4f2fdce7900517fa69f3cd6d1"
    }
};

/*
 * Router middleware to handle CORS issues
 */
// const CORS_AllowAllHeaders = (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, X-Auth-Token');
//     next();
// };
// 
// app.use(CORS_AllowAllHeaders);

/**
 * An example function to send replies to the user
 * @param  body            	The message body of the reply
 * @param  conversation_id 	ID of the conversation to send this reply to
 * @param  admin_id       	ID of the admin who's authoring this reply
 * @param  token           	Access Token as provided by Intercom
 */
const intercomReply = (body, conversation_id) =>
{
    let query_url = 'https://api.intercom.io/conversations/' + conversation_id + '/reply';

    // Provided by Intercom
    const ACCESS_TOKEN = 'dG9rOmVlMjcwZGNlX2U1OTVfNDcyNF9iNTEzXzEwMTIxYzk3OTdmZToxOjA=';
    // The representative admin id to be used for all reply dispatches
    const ADMIN_ID = '1733279';
    // Define Fetch headers
    let _headers = {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    // Populate payload
    let data = {
        'type': 'admin',
        'admin_id': ADMIN_ID,
        'body': body,
        'message_type': 'comment'
    };

    // Dispatch data
    fetch(query_url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: _headers
    }).then(response => response.json())
    .catch(error => { console.log('Error: ' + error); })
    .then(response => { console.log(response); });
};

/**
 * Processes Webhook notifications from Intercom
 */
app.post('/intercom_webhook', (req, res) => {
    res.status(200).send('OK');
    console.log(util.inspect(req.body, false, null));

    // Notification payload
    let item = req.body.data.item;
    let convop = item.conversation_parts;

    // Extract necessary data to be able to reply
    let conversation_id = item.id;

    let msg = '';
    // Check if this is the lead message
    if (convop.total_count === 0) {
        msg = item.conversation_message.body;
    } else {
        // Intercom may dispatch one or more user messages all
        // at once, we only care about the last one
        msg = convop.conversation_parts[convop.total_count-1].body;
    }

    // Sanitize incoming messages.
    // All incoming messages come wrapped in one or the other HTML tags.
    // We simply strip out this opening and closing tags
    msg = msg.replace(/<[^>]+>/g, '');
    // Make user messages case-insensitive
    msg = msg.toLowerCase();

    // Print the me ssage sent by the user
    console.log('User says: ' + msg);

    // Dispatch reply
    reply = hasuraRetreive(msg, (resp) => {
        console.log("Reply : " + resp);
        intercomReply(resp, conversation_id);
    });
});

/**
 * An example function to insert key value pair to Hasura Data API
 * @param  data     An array of {key, message} objects
 */
const hasuraInsert = (data, onReturn) => {
    var url_data_query = HASURA_CONFIG.urls.data;
    var ACCESS_TOKEN = HASURA_CONFIG.token.admin;

    // Define Fetch headers
    let _headers = {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // Populate payload
    let payload = {
        'type': 'insert',
        "args": {
            "table": "reply_store",
            "objects": data
        }
    };

    console.log(util.inspect(payload, false, null));

    // Dispatch payload
    fetch(url_data_query, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: _headers
    }).then(response => response.json())
    .catch(error => { console.log('Error: ' + error); })
    .then(response => {
        console.log(response);
        onReturn && onReturn(response);
    });
};

/**
 * An example function to get the value from the key!
 * @param  key      The message body of the reply
 */
const hasuraRetreive = (key, callback) => {
    var url_data_query = HASURA_CONFIG.urls.data;
    var ACCESS_TOKEN = HASURA_CONFIG.token.admin;

    // Define Fetch headers
    let _headers = {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    // Populate payload
    let data = {
        "type": "select",
        "args": {
            "table": "reply_store",
            "columns": [ "message" ],
            "where" : {"key" : key}
        }
    };

    console.log(util.inspect(data, false, null) + "\n\n\n");

    // Dispatch data
    fetch(url_data_query, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: _headers
    }).then(response => {
        return response.text()
    }).catch(error => {
        console.log('Error: ' + error);
        callback("Error");
    }).then(response => {
        console.log("Resp : " + response);
        
        let parsed_resp = JSON.parse(response);
        console.log(parsed_resp);
        
        if (parsed_resp.length === 0) {
            callback("I'm sorry, I couldn't understand that.")
        } else {
            callback(parsed_resp[0].message);
        }
    });
};

app.post("/add_entries", function (req, res) {
    console.log(req.body); // populated!

    // Make sure keys are lowercase
    let data = req.body.data.map((value) => {
        return { key: value.key.toLowerCase(), message: value.message };
    });

    hasuraInsert(data, (response) => {
        if (response.affected_rows)
            res.status(200).send({ status: 'success' });
        else
            res.status(500).send({ status: 'error' });
    });
});

app.get("/get_value", function (req, res) {
    var k = req.query.key;
    console.log("key = " + k);

    hasuraRetreive(k, function(ress) {
        console.log("Response from callback function : " + ress);
        res.send(JSON.stringify({"val" : ress}));
    });
});

var port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('Example app listening on port ' + port);
});
