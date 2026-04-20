const GeneralError = require("./GeneralError");

class ConflictError extends GeneralError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = ConflictError;
