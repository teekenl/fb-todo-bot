/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 *
 * List of helper function.
 *
 */

var bot_command = require('./bot_command'),
    command = {
        add: bot_command.add,
        remove: bot_command.remove,
        edit: bot_command.edit,
        clear: bot_command.clear,
        list: bot_command.list,
        invalidCommand: bot_command.invalidCommand,
        filterCompleted: bot_command.completed,
        filterIncompleted: bot_command.incompleted,
        tick: bot_command.tick,
        untick: bot_command.untick,
        help: bot_command.help,
        detail: bot_command.detail
    };


function isNumeric(n) {
    if(n===undefined) throw new Error("Key parameter is not entered");
    return (typeof n === "number" && !isNaN(n));
}

function verifiedCommand(message, command){
    if(message.body===undefined) return;
    return message.body.toLowerCase().includes(command);
}

function createJSONFormat(todo){
    return {
        "todo":todo,
        "date": new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        "completed": "no"
    };
}

function hasItem(event, fb, todo) {
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

function hasItemIndex(event, fb, todo) {
    if(!helper.isNumeric(parseInt(todo))) return false;

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

module.exports = {
    isNumeric: isNumeric,
    createJSONFormat: createJSONFormat,
    hasItem: hasItem,
    hasItemIndex: hasItemIndex,
    verifiedCommand: verifiedCommand
};
