var request = require('request');

function list(event, api, fb) {
    fb.child("" + event.threadID).once("value", function(data) {
        var message = "TODO LIST:\n";
        var message_count = 0;
        for (var todo in data.val()){
            message_count++;
            message += message_count + ": " + data.val()[x] + "\n";
        }
        if(message_count === 0) {
            message += "NO ITEM ADDED";
        }
        api.sendMessage(message, event.threadID);
    });
}

function add(event, api, fb) {
    var todo = event.body.substring(5);
    if(todo.length > 0) {
        fb.child(event.threadID).push(todo.trim());
        api.sendMessage(todo + "has been added to your todo-list", event.threadID);
        list(event,api, fb);
    } else {
        api.sendMessage("the name of todo should not be empty");
    }
}

function remove(event, api, fb) {
    var todo = event.body.substring(5);
}


function edit(event, api, fb) {
    var todo = event.body.substring(5);
}

function changeTextColor(event, api, fb) {

}

function elo(event, api, fb) {
    var name = event.body.substring(5);
    request('rasd',function(err, response) {
        if(err) console.error(err);


    });
}


module.exports = {
    add: add,
    remove: remove,
    elo: elo,
    edit: edit,
    clear: clear,
    changeTextColor: changeTextColor
};