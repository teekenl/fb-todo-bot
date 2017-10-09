var bot_command = require('./bot_command'),
    isValidCommand = require('./helper').isValidCommand,
    commandList = {
        add: bot_command.add,
        remove: bot_command.remove,
        edit: bot_command.edit,
        clear: bot_command.clear,
        list: bot_command.list,
        invalidCommand: bot_command.invalidCommand,
        completed: bot_command.completed,
        incompleted: bot_command.incompleted,
        tick: bot_command.tick,
        untick: bot_command.untick,
        help: bot_command.help,
        detail: bot_command.detail,
        picture: bot_command.picture
    };

function getCommand(message, inputCommand) {
    message = message.body !== null ? message.body : message;
    inputCommand = typeof(inputCommand) === 'string'
        ? inputCommand.replace('/','') :
        inputCommand.toString().replace('/','');

    if(isValidCommand(message, inputCommand, commandList))
        return commandList[inputCommand];
    else
        return null;
}

module.exports = {
    getCommand: getCommand
};
