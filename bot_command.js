var request = require('request'); // or using tinyreq module for small or simple request
var $ = require('cheerio');

// Helper function to validate the numeric input from reading message.
function isNumeric(n) {
    return (typeof n === "number" && !isNaN(n));
}

function createJSONFormat(todo){
    return {
        "todo":todo,
        "date": new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        "completed": "no"
    };
}

function editItem(event, api, fb, index, newTodo) {
    if(isNumeric(parseInt(index))) {
        index = parseInt(index);
    } else{
        api.sendMessage("No item was found", event.threadID);
        return;
    }

    fb.child(event.threadID).once("value", function(data) {
        var count = 1;
        for (var x in data.val()) {
            if(count === index) {
                fb.child(event.threadID).child(x).set({
                    "todo": newTodo,
                    "date": new Date().toLocaleTimeString() + " " + new Date().toLocaleTimeString(),
                    "completed": "no"
                });
                api.sendMessage("No: " + count +" item's name has been updated ", event.threadID);
                //list(event, api, fb);
            }
            count ++;
        }
    });
}

function hasItem(event, api, fb, todo) {
    fb.child(event.threadID).once("value",function(data) {
        for (var element in data.val()){
            var child_JSON = data.val()[element];
            if(child_JSON.todo === todo) {
                fb.child(event.threadID).child(element).set(null);
                return true;
            }
        }
    });
    return false;
}

function hasItemIndex(event, api, fb, todo) {
    if(!isNumeric(parseInt(todo))) return false;

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
            message += message_count + ": " + data.val()[todo].todo + "\n";
        }
        if(message_count === 0) {
            message += "NO ITEM ADDED";
        }
        api.sendMessage(message, event.threadID);
    });
}

function filterList(event, api, fb, type) {
    var message_type = type === "yes" ? "COMPLETED" : "INCOMPLETED";
    var message = "TODO LIST  ( " + message_type +" )\n";
    var message_count = 0;

    console.log("Filter request from "+ event.threadID);
    console.log("Filtering...");

    fb.child("" + event.threadID).once("value", function(data) {
        for (var element in data.val()){
            var child_JSON = data.val()[element];
            if(child_JSON.completed === type) {
                message_count ++;
                message += message_count + ": " + child_JSON.todo + "\n";
            }
        }
        if(message_count > 0 ) {
            api.sendMessage(message,event.threadID);
        } else{
            if(message_type === "COMPLETED") {
                api.sendMessage("You have not yet completed anything. \n" +
                    "Enter /incompleted to find more about it" , event.threadID);
            } else{
                api.sendMessage("Good Job, You are perfectly fine\n" +
                    "You have nothing left behind.", event.threadID);
            }
        }
    });

}

function updateList(event, api, fb, type, todo) {
    var itemFound = false;
    var tick = type === "tick" ? "yes" : "no";

    console.log("Updating request from "+ event.threadID + " \n for item: " + todo);
    console.log("Updating...");

    fb.child(event.threadID).once("value", function(data) {
        for (var element in data.val()){
            var child_JSON = data.val()[element];

            if(child_JSON.todo === todo  && !itemFound) {
                fb.child(event.threadID).child(element).set({
                    "todo": child_JSON.todo,
                    "date": new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                    "completed": tick
                });
                itemFound = true;
                console.log("The request is updated");
            }
        }
        if(itemFound) {
            var message_status = type === "tick" ? " is completed" : " is not completed";
            api.sendMessage("The " + todo + message_status , event.threadID);
            console.log(todo + "'status has been updated ");
        } else{
            api.sendMessage("No item was found \n" +
                "Have you forgotten your todo? \n" +
                "Enter /list to find out more about it", event.threadID);
        }
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

    if(todo.length > 0) {
        if(hasItem(event, api, fb, todo) || hasItemIndex(event,api,fb, todo)) {
            api.sendMessage(todo + " has been removed from your todo-list", event.threadID);
            console.log("One item is removed");
        } else {
            api.sendMessage(todo + " was not found. ", event.threadID);
        }
    } else {
        pi.sendMessage("Please provide the name of todo", event.threadID);
    }
}


function edit(event, api, fb) {
    var todoArray = event.body.substring(6).split(" ");

    if(todoArray.length > 1) {
        var todoIndex = todoArray[0];
        var newTodoItem = todoArray [1];

        editItem(event, api, fb, todoIndex, newTodoItem);
        console.log("One item is edited");

    } else{
        invalidCommand(event, api, fb);
    }

}

function clear(event, api, fb) {
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
        // More feature will be available soon
    });
}

function completed(event,api, fb) {
    filterList(event,api,fb,"yes");
}

function incompleted(event, api, fb) {
    filterList(event,api,fb,"no");
}

function tick(event, api, fb) {
    var todo = event.body.substring(6).toLowerCase().trim();
    updateList(event,api, fb, "tick", todo);
}

function untick(event, api, fb) {
    var todo = event.body.substring(8).toLowerCase().trim();
    updateList(event, api, fb, "untick", todo);
}


function invalidCommand(event,api, fb) {
    var error  = "You have entered invalid command \n";
    var message = "Please try command in the below: \n" +
                    "1) /add (item) \n" +
                    "2) /remove (item) \n" +
                    "3) /clear (item) \n" +
                    "4) /edit index (item) \n" +
                    "5) /tick (item)\n" +
                    "6) /untick (item) \n" +
                    "7) /completed \n" +
                    "8\) /incompleted \n" +
                    "9) /detail (item) \n";

    api.sendMessage(error+message,event.threadID);
}

function help(event, api) {
    var message = "The command line \n" +
                    "1) /add (item) \n" +
                    "2) /remove (item) \n" +
                    "3) /clear (item) \n" +
                    "4) /edit index (item) \n" +
                    "5) /tick (item)\n" +
                    "6) /untick (item) \n" +
                    "7) /completed \n" +
                    "8\) /incompleted \n" +
                    "9) /detail (item) \n";
    api.sendMessage(message, event.threadID);
}

function detail(event, api, fb) {
    var todo = event.body.substring(8).toLowerCase().trim();
    var message = "The " + todo + " 's details are as per below:\n";
    fb.child(event.threadID).once("value", function(data) {
        data.forEach(function(childData){
            var child_JSON = childData.val();
            if(child_JSON.todo === todo) {
                message+= "Item: " + child_JSON.todo + "\n";
                message+= "Created at: " + child_JSON.date + "\n";
                message+= "Status: " + (child_JSON.completed === "yes" ? "Completed": "Not completed");
                return true;
            }
        });
        api.sendMessage(message, event.threadID);
    });

}

module.exports = {
    add: add,
    remove: remove,
    elo: elo,
    edit: edit,
    clear: clear,
    list: showList,
    changeTextColor: changeTextColor,
    invalidCommand: invalidCommand,
    filterCompleted: completed,
    filterIncompleted: incompleted,
    tick: tick,
    untick: untick,
    help: help,
    detail: detail
};
