/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 *
 * List of helper function.
 *
 */

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
    hasItemIndex: hasItemIndex
};
