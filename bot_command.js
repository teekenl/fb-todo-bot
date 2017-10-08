/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 * Recent Updated Date: 7 Oct 2017
 *
 * List of command with implementation logic.
 *
 * Note: User id = event.threadID
 */

var $ = require('cheerio');
var helper = require('./helper');


// Edit the todo item with given user_id
function editItem(event, api, fb, index, newTodo) {
    if(helper.isNumeric(parseInt(index))) {
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

// List all todo item with given user_id
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

// To add todo item with given user_id
function add(event, api, fb) {
    var todo = event.body.substring(5).toLowerCase().trim();
    console.log(todo);
    if(todo.length > 0) {
        fb.child(event.threadID).push(helper.createJSONFormat(todo));
        api.sendMessage(todo + " has been added to your todo-list", event.threadID);
        console.log("One item is added");
        //list(event,api, fb);
    } else {
        api.sendMessage("Please provide the name of todo", event.threadID);
    }
}

// To remove todo item with given todoname
function remove(event, api, fb) {
    var todo = event.body.substring(8).toLowerCase().trim();

    if(todo.length > 0) {
        if(helper.hasItem(event, fb, todo) || helper.hasItemIndex(event,fb, todo)) {
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

// To delete all todo item with given user id
function clear(event, api, fb) {
    fb.child(event.threadID).set(null);
    console.log("All items cleared", event.threadID);
}

// To show the todo item has already completed with given user id
function completed(event,api, fb) {
    filterList(event,api,fb,"yes");
}

// To show the todo item has already incompleted with given user id
function incompleted(event, api, fb) {
    filterList(event,api,fb,"no");
}

// To mark the todo item to the completed status with given todo name
function tick(event, api, fb) {
    var todo = event.body.substring(6).toLowerCase().trim();
    updateList(event,api, fb, "tick", todo);
}

// To mark the todo item to the incompleted status with given todo name
function untick(event, api, fb) {
    var todo = event.body.substring(8).toLowerCase().trim();
    updateList(event, api, fb, "untick", todo);
}

// To render invalid command error and prompt available command to the user
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

// To render available command to the user
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

// To extract todo item's detail with given todo name
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
    edit: edit,
    clear: clear,
    list: list,
    invalidCommand: invalidCommand,
    filterCompleted: completed,
    filterIncompleted: incompleted,
    tick: tick,
    untick: untick,
    help: help,
    detail: detail
};
