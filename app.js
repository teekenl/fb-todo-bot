// Initialize the required libraries
var fs = require('fs');
var express = require('express');
var app = express();
var fb_api = require('facebook-chat-api');
var Firebase = require('firebase');

var config = require('./config');

var firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    databaseURL: config.databaseURL,
    storageBucket: config.storageBucket
};

var fb = Firebase.initializeApp(firebaseConfig).database().ref();

var command = require('./bot_command');


var request = require('request');
var cheerio = require('cheerio');
var port = process.env.PORT || 3000;

app.get('/',function(req,res){
    res.send('Welcome to Fb todo created by ken lau');
});


var server = app.listen(port, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("running at http://%s:%s",host,port);
});


function verifiedCommand (event, command){
    return event.body.toLowerCase().includes(command);
}


fb_api({email: config.bot_email,password: config.bot_password}, function callback(err, api) {
    if(err) return console.error("Error message:" +  err);

    api.setOptions({
        listenEvents: true // Set the listener to be true. Bot started to listen
    });

    var stopListening = api.listen(function(err, event) {
        if(err) return console.error("API stopped listening due to" + err);

        switch(event.type) {
            case "message":
                if (event.body !== null || event.body.substring(1, 0) === '/') {
                    if (verifiedCommand(event, "/add")) {
                        command.add(event, api, fb);
                    } else if (verifiedCommand(event, "/elo")) {
                        command.elo(event, api, fb);
                    } else if (verifiedCommand(event, "/remove")) {
                        command.remove(event, api, fb);
                    } else if (verifiedCommand(event, "/edit")) {
                        command.edit(event, api, fb);
                    } else if (verifiedCommand(event, "/clear")) {
                        command.clear(event, api, fb);
                    } else if (verifiedCommand(event, "/stop")) {
                        console.log("The todo bot has been stopped");
                        api.sendMessage("Goodbye.", event.threadID);
                        //return stopListening();
                    } else if (verifiedCommand(event, "/list")) {
                        command.list(event, api, fb);
                    } else {
                        console.log("Invalid command received.");
                        command.invalidCommand(event, api, fb);
                    }
                } else {
                    console.log("Wrong message received.");
                    command.invalidCommand(event, api, fb);
                }
        }

    });
});

