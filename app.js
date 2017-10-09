
var express = require('express'),
    app = express(),
    router = require('./route'),
    fb_api = require('facebook-chat-api'),
    Firebase = require('firebase'),
    config = require('./config'),
    firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        databaseURL: config.databaseURL,
        storageBucket: config.storageBucket
    },
    command = require('./util').getCommand,
    invalidCommand = require('./bot_command').invalidCommand,
    error = require('./error'),
    port = process.env.PORT || 3000, // initialize port number
    fb = Firebase.initializeApp(firebaseConfig).database().ref();

// Set up server listening port.
var server = app.listen(port, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("running at http://%s:%s",host,port);
});

// Use the routing declared in router.js
app.use('',router);

fb_api({email: config.bot_email,password: config.bot_password}, function callback(err, api) {
    if(err) return console.error("Error message:" +  err);

    api.setOptions({
        listenEvents: true // Set the listener to be true. Bot started to listen
    });

    // Automated notification will be added here. More feature coming soon.

    var stopListening = api.listen(function(err, event) {
        if(err) return console.error("API stopped listening due to" + err);

        var indicator = api.sendTypingIndicator(event.threadID, undefined)(function (err) {
            if(err) throw err;
            switch(event.type) {
                case "message":
                    var thread_message = event.body !== null ?
                                            event.body.split(' '): null;

                    if(thread_message.length > 0 || thread_message[0] === '/list' ) {
                        var exec_command = command(event,thread_message[0]);
                        if(exec_command !== null) {
                            console.log("valid command received");
                            exec_command(event,api,fb);
                        } else {
                            console.log("wrong command received.");
                            invalidCommand(event, api, fb, error.wrongCommand);
                        }
                    } else {
                        // wrong format puts here
                        console.log("wrong command received.");
                        invalidCommand(event, api, fb, error.noMessage);
                    }
            }
        });
        api.markAsRead(event.threadID, function(err){
            if(err) console.log(err);
        });
    });
});

