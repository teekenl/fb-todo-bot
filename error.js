/**
 * Author: TeeKen Lau
 * Date: Sept 2017
 *
 * List of error message and code.
 *
 */

const ERROR_NO_FILENAME = "Please enter a filename",
      ERROR_NOT_FOUND = "The todo is not found",
      ERROR_NAME_FORMAT = "The filename has to be in string",
      ERROR_COMMAND = "Please enter a valid command",
      ERROR_INDEX_FORMAT = "The index has to be in number",
      ERROR_COMMAND_FORMAT = "The format of command is wrong",
      ERROR_NO_MESSAGE = "Please enter a message follow by a command",
      ERROR_INTERNAL_SERVER = "Network connection issue";

module.exports = {
    noFileName: ERROR_NO_FILENAME,
    todoNotFound: ERROR_NOT_FOUND,
    wrongCommand: ERROR_COMMAND,
    wrongCommandFormat: ERROR_COMMAND_FORMAT,
    wrongNameFormat: ERROR_NAME_FORMAT,
    wrongIndexFormat: ERROR_INDEX_FORMAT,
    noMessage: ERROR_NO_MESSAGE,
    internal_server: ERROR_INTERNAL_SERVER
};
