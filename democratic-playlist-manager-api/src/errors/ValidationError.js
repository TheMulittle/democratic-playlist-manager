const GeneralError = require("./GeneralError");

class ValidationError extends GeneralError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = ValidationError;
