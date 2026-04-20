const GeneralError = require("./GeneralError");

class UserNotAuthenticatedError extends GeneralError {
  constructor() {
    super(
      "The user is not authenticated. Please ensure to authenticate before performing this action",
      401
    );
  }
}

module.exports = UserNotAuthenticatedError;
