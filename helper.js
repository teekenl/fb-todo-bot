/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 *
 * List of helper function.
 *
 */

function isNumeric(n) {
    if(n === null) throw new Error("Key parameter is not entered");
    return (typeof n === "number" && !isNaN(n));
}

function hasItem(event,fb, todo, callback) {
    var itemFound = false;
    fb.child(event.threadID).once("value", function(data) {
        for(var element in data.val()) {
            var child_JSON = data.val()[element];
            if(child_JSON.todo === todo) {
                itemFound = true;
            }
        }
        callback(itemFound);
    })
}

function hasItemAndRemove(event, fb, todo, callback) {
    var itemFound = false;
    fb.child(event.threadID).once("value",function(data) {
        for (var element in data.val()){
            var child_JSON = data.val()[element];
            if(child_JSON.todo === todo) {
                fb.child(event.threadID).child(element).set(null);
                itemFound = true;
            }
        }
        callback(itemFound);
    });
}

function hasItemIndexAndRemove(event, fb, todo, callback) {
    var itemFound = false;
    if(!isNumeric(parseInt(todo))) return false;

    fb.child(event.threadID).once("value",function(data) {
        var count = 1;
        for (var x in data.val()) {

            if(count === parseInt(todo)) {
                fb.child(event.threadID).child(x).set(null);
                itemFound = true;
            }
            count++;
        }
        callback(itemFound);
    });
}

function isValidCommand(message, inputCommand,commandList) {
    if(message === null) return;
    return message.toLowerCase().includes(inputCommand)
                && commandList.hasOwnProperty(inputCommand)
                    && message.indexOf(inputCommand) === 1;
}

function replaceCommandWithEmptyString(todo) {
    return todo.replace('/add','')
               .replace('/remove','')
               .replace('/detail','')
               .replace('/tick','')
               .replace('/untick','')
               .replace('/completed','')
               .replace('/incompleted','')
               .replace('/clear','')
               .replace('/help','')
               .replace('/list','')
               .replace('/edit','')
               .replace('/picture','')
}

function getTodoName(todo) {
    return typeof(todo) === 'string' ?
                replaceCommandWithEmptyString(todo) :
                    replaceCommandWithEmptyString(todo.toString());
}

function getTodoNameWithLowerCase(todo) {
    return getTodoName(todo).toLowerCase();
}

function createJSONFormat(todo){
    return {
        "todo":todo,
        "date": new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        "completed": "no",
        "photo_name": ""
    };
}

// Update the todo compeletion status
function updateTodo(event, api, fb, type, todo) {
    var itemFound = false,
        tick = type === true ? "yes" : "no";

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

// Update todo photo name
function updateTodoPhoto(event, api, fb,filename) {
    var itemFound = false;
    console.log("Updating request from "+ event.threadID + " \n for item: " + todo);
    console.log("Updating...");
    fb.child(event.threadID).once("value", function(data) {
        for(var element in data.val()){
            var child_JSON = data.val()[element];
            if(child_JSON.todo === todo) {
                fb.child(event.threadID).child(element).set({
                    "photo_name": filename
                });
                itemFound = true;
                console.log("The request is updated");
                break;
            }
        }
        if(itemFound) {
            api.sendMessage("The picture of todo has been updated", event.threadID);
        } else{
            api.sendMessage("No item was found \n" +
                "Have you forgotten your todo? \n" +
                "Enter /list to find out more about it", event.threadID);
        }
    });
}

//to filter the list of todo item with matched status.
function filterList(event, api, fb, type) {
    var message_type = type === "yes" ? "COMPLETED" : "INCOMPLETED",
        message = "TODO LIST  ( " + message_type +" )\n",
        message_count = 0;

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

module.exports = {
    isNumeric: isNumeric,
    hasItemAndRemove: hasItemAndRemove,
    hasItemIndexAndRemove: hasItemIndexAndRemove,
    hasItem: hasItem,
    isValidCommand: isValidCommand,
    createJSONFormat: createJSONFormat,
    filterList: filterList,
    updateTodo: updateTodo,
    updateTodoPhoto: updateTodoPhoto,
    getTodoName: getTodoName,
    getTodoNameWithLowerCase: getTodoNameWithLowerCase
};
