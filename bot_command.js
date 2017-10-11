/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 * Recent Updated Date: 7 Oct 2017
 *
 * List of command with implementation logic.
 *
 * Note: User id = event.threadID
 */

var $ = require('cheerio'),
    helper = require('./helper'),
    error = require('./error'),
    help_message = '',
    axios = require('axios'),
    userThreadID = {}; // store the session for user who want to update photo.

var availableCommandMessage = "Available commands are shown as per below: \n" +
                                "1) /add (item) \n" +
                                "2) /remove (item) \n" +
                                "3) /clear (item) \n" +
                                "4) /edit index (item) \n" +
                                "5) /tick (item)\n" +
                                "6) /untick (item) \n" +
                                "7) /completed \n" +
                                "8\) /incompleted \n" +
                                "9) /detail (item) \n";

// To extract todo item's detail with given todo name
function detail(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" "),
        message = "The " + todo + " 's details are as per below:\n";
    if(todo.length > 0) {
        if(todo.length === 2) {
            fb.child(event.threadID).once("value", function(data) {
                var itemFound = false;
                data.forEach(function(childData){
                    var child_JSON = childData.val();
                    if(child_JSON.todo === todo[1] && !itemFound) {
                        message+= "Item: " + child_JSON.todo + "\n";
                        message+= "Created at: " + child_JSON.date + "\n";
                        message+= "Status: " + (child_JSON.completed === "yes" ? "Completed": "Not completed");
                        message+= "\n\n";
                        itemFound = true;
                    }
                });

                if(itemFound) {
                    api.sendMessage(message, event.threadID);
                } else{
                    api.sendMessage(error.todoNotFound, event.threadID);
                }
            });
        } else{
            invalidCommand(event,api,fb,error.wrongCommandFormat)
        }
    } else {
        api.sendMessage(error.noFileName, event.threadID);
    }
}

// List all todo item with given user_id
function list(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).trim();
    if(todo.length <= 0 ) {
        fb.child("" + event.threadID).once("value", function(data) {
            var message = "TODO LIST:\n",
                message_count = 0;

            for (var todo in data.val()){
                message_count++;
                message += message_count + ": " + data.val()[todo].todo + "\n";
            }
            if(message_count === 0) {
                message += "NO ITEM ADDED";
            }
            api.sendMessage(message, event.threadID);
        });
    } else{
        invalidCommand(event, api, fb, error.wrongCommandFormat);
    }
}

// To add todo item with given user_id
function add(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");
    if(todo.length > 0) {
        if(todo.length === 2) {
            fb.child(event.threadID).push(helper.createJSONFormat(todo[1]));
            api.sendMessage(todo[1] + " has been added to your todo-list", event.threadID);
            console.log("One item is added");
        } else {
            invalidCommand(event, api, fb, error.wrongCommandFormat);
        }
    } else {
        api.sendMessage(error.noFileName, event.threadID);
    }
}

// To remove todo item with given todoname
function remove(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");

    if(todo.length > 0) {
        if(todo.length === 2) {
            helper.hasItemAndRemove(event,fb,todo[1],function(response){
                if(response) {
                    api.sendMessage("The todo has been removed from your todo-list",
                        event.threadID);
                    console.log("One item is removed");
                } else{
                    // check by item index
                    helper.hasItemIndexAndRemove(event,fb,todo[1], function(response) {
                        if(response){
                            api.sendMessage(todo + " has been removed from your todo-list",
                                event.threadID);
                            console.log("One item is removed");
                        } else{
                            api.sendMessage(error.todoNotFound, event.threadID);
                        }
                    });
                }
            });
        } else {
            invalidCommand(event,api,fb,error.wrongCommandFormat);
        }
    } else {
        api.sendMessage(error.noFileName, event.threadID);
    }
}

// Edit the todo item with given user_id
function edit(event, api, fb) {
    var todoArray = helper.getTodoNameWithLowerCase(event.body).split(" ");

    if(todoArray.length > 0) {
        if(todoArray.length === 3) {
            var todoIndex = todoArray[1],
                newTodoItem = todoArray [2];
            editItem(event, api, fb, todoIndex, newTodoItem);
        } else{
            invalidCommand(event, api, fb, error.wrongCommandFormat);
        }
    } else {
        api.sendMessage(error.noFileName, event.threadID);
    }

    function editItem(event, api, fb, index, newTodo) {
        if(helper.isNumeric(parseInt(index))) {
            index = parseInt(index);
        } else{
            api.sendMessage(error.wrongIndexFormat, event.threadID);
            return;
        }

        fb.child(event.threadID).once("value", function(data) {
            var count = 1;
            for (var x in data.val()) {
                if(count === index) {
                    fb.child(event.threadID).child(x).update({
                        "todo": newTodo,
                        "date": new Date().toLocaleTimeString() + " " + new Date().toLocaleTimeString()
                    });
                    api.sendMessage("No: " + count +" item's name has been updated ", event.threadID);
                    break;
                }
                count ++;
            }
            console.log("One item is edited");
        });
    }
}

// To delete all todo item with given user id
function clear(event, api, fb) {
    fb.child(event.threadID).set(null);
    console.log("All items cleared", event.threadID);
}

// To show the todo item has already completed with given user id
function completed(event,api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");
    if(todo.length===1 && todo[0] === '') {
        helper.filterList(event,api,fb,"yes");
    } else {
        invalidCommand(event,api,fb,error.wrongCommandFormat);
    }

}

// To show the todo item has already incompleted with given user id
function incompleted(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");
    if(todo.length===1 && todo[0] === '') {
        helper.filterList(event,api,fb,"no");
    } else{
        invalidCommand(event, api, fb, error.wrongCommandFormat);
    }
}

// To mark the todo item to the completed status with given todo name
function tick(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");
    if(todo.length > 0) {
        if(todo.length === 2) {
            helper.updateTodo(event,api, fb, true, todo[1]);
        } else {
            invalidCommand(event,api,fb,error.wrongCommandFormat);
        }
    } else {
        api.sendMessage(error.noFileName,event.threadID);
    }
}

// To mark the todo item to the incompleted status with given todo name
function untick(event, api, fb) {
    var todo = helper.getTodoNameWithLowerCase(event.body).split(" ");
    if(todo.length > 0) {
        if(todo.length === 2) {
            helper.updateTodo(event, api, fb, false, todo[1]);
        } else {
            invalidCommand(event,api,fb,error.wrongCommandFormat);
        }
    } else {
        api.sendMessage(error.noFileName,event.threadID);
    }
}

// Store picture to the todo with given user id and todo item name
function picture(event, api, fb) {
    if(!userThreadID.hasOwnProperty(event.threadID.toString())) {
        userThreadID[event.threadID.toString()] =  event.body ?
                        helper.getTodoNameWithLowerCase(event.body).trim():"todo";
        if(helper.hasItem(event,api,userThreadID[event.threadID.toString()])) {
            api.sendMessage("Please attach one photo",event.threadID);
        } else{
            api.sendMessage(error.todoNotFound,event.threadID);
            delete userThreadID[event.threadID];
        }
    } else {
        var todo = event.body ? helper.getTodoNameWithLowerCase(event.body).trim(): "todo",
            downLoadUrl = event.attachments[0].previewUrl;
        axios.post('/storePhoto', {
            downloadUrl: downLoadUrl,
            filename: event.threadID + todo
        }).then(function(response) {
            if(response.status === 200) {
                console.log(response.data);
                // terminate the session of user after photo has been added
                helper.updateTodoPhoto(event,api,fb,response.data);
                delete userThreadID[event.threadID];
            } else{
                api.sendMessage(error.internal_server,event.threadID);
            }
        }).catch(function(err) {
            console.log(err);
        });
    }
}


// To render invalid command error and prompt available command to the user
function invalidCommand(event,api, fb, error) {
    var renderMessage = error +  '\n' + availableCommandMessage;
    api.sendMessage(renderMessage,event.threadID);
}

// To render available command to the user
function help(event, api,fb) {
    api.sendMessage(availableCommandMessage, event.threadID);
}

module.exports = {
    add: add,
    remove: remove,
    edit: edit,
    clear: clear,
    list: list,
    invalidCommand: invalidCommand,
    completed: completed,
    incompleted: incompleted,
    tick: tick,
    untick: untick,
    help: help,
    detail: detail,
    picture: picture
};
