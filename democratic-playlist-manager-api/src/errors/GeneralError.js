class GeneralError extends Error {
  constructor(message, code = 500) {
    super();
    this.message = message;
    this.code = code;
  }
}

module.exports = GeneralError;
