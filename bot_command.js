var request = require('request');


function isNumeric(n) {
    return (typeof n === "number" && !isNaN(n));
}

function createJSONFormat(todo){
    return {
        "todo":todo,
        "date": new Date()
    };
}


function hasItem(event, api, fb, todo) {
    fb.child(event.threadID).once("value",function(data) {
        data.foreach(function(childData){
            var child_json = childData.val();

            if(child_json.todo === todo) {
                fb.child(event.threadID).child(childData.key).set(null);
                return true;
            }
        });
    });
    return false;
}

function hasItemIndex(event, api, fb, todo) {
    if(!isNumeric(todo)) return false;

    fb.child(event.threadID).once("value",function(data) {
        var count = 1;
        for (var x in data.val()) {

            if(count === parseInt(todo)) {
                fb.child(event.threadID).child(x).set(null);
                return true;
            }

            count++;
        }
    });
    return false;
}

function list(event, api, fb) {
    fb.child("" + event.threadID).once("value", function(data) {
        var message = "TODO LIST:\n";
        var message_count = 0;
        for (var todo in data.val()){
            message_count++;
            message += message_count + ": " + data.val()[todo] + "\n";
        }
        if(message_count === 0) {
            message += "NO ITEM ADDED";
        }
        api.sendMessage(message, event.threadID);
    });
}

function add(event, api, fb) {
    var todo = event.body.substring(5).toLowerCase().trim();
    console.log(todo);
    if(todo.length > 0) {
        fb.child(event.threadID).push(createJSONFormat(todo));

        api.sendMessage(todo + " has been added to your todo-list", event.threadID);
        console.log("One item is added");
        //list(event,api, fb);
    } else {
        api.sendMessage("Please provide the name of todo", event.threadID);
    }
}

function remove(event, api, fb) {
    var todo = event.body.substring(8).toLowerCase().trim();
    console.log("One item is removed");
    if(todo.length > 0) {
        if(hasItem(event, api, fb, todo) || hasItemIndex(event,api,fb, todo)) {
            api.sendMessage(todo + " has been removed from your todo-list", event.threadID);
        } else {
            api.sendMessage(todo + " was not found. ", event.threadID);
        }
    } else {
        pi.sendMessage("Please provide the name of todo", event.threadID);
    }
}


function edit(event, api, fb) {
    var todo = event.body.substring(6).toLowerCase().trim();
    if(todo.length > 0) {

    }
    console.log("One item is edited");
}

function clear(event, api, fb) {
    var todo = event.body.substring(7).toLowerCase().trim();
    fb.child(event.threadID).set(null);
    console.log("All items cleared", event.threadID);
}


function changeTextColor(event, api, fb) {
}

function showList(event, api, fb) {
    list(event, api, fb);
}


function elo(event, api, fb) {
    var name = event.body.substring(5);
    request('rasd',function(err, response) {
        if(err) console.error(err);


    });
}

function invalidCommand(event,api, fb) {
    var error  = "The command entered is invalid\n";
    var message = "Please try command in the below: \n" +
                    "1) /add (item) \n" +
                    "2) /remove (item) \n" +
                    "3) /clear (item) \n" +
                    "4) /edit (item) \n";

    api.sendMessage(error+message,event.threadID);
}


module.exports = {
    add: add,
    remove: remove,
    elo: elo,
    edit: edit,
    clear: clear,
    list: showList,
    changeTextColor: changeTextColor,
    invalidCommand: invalidCommand
};