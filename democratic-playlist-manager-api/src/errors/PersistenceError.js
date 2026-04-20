const GeneralError = require("./GeneralError");

class PersistenceError extends GeneralError {
  constructor(message) {
    super(message, 500);
  }
}

module.exports = PersistenceError;
