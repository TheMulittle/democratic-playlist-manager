const GeneralError = require("./GeneralError");

class ResourceNotFoundError extends GeneralError {
  constructor(message) {
    super(`Resource not found: ${message}`, 404);
  }
}

module.exports = ResourceNotFoundError;
