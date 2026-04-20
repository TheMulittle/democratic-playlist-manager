const authenticated = {};
const PersistenceError = require("../errors/PersistenceError");

function add(refreshToken, user) {
  if (typeof refreshToken !== "string") {
    throw new PersistenceError(
      `Unable to persist an user with refresh token different than a string. Instead it was [${typeof refreshToken}]`
    );
  }
  authenticated[refreshToken] = user;
}

function get(refreshToken) {
  return authenticated[refreshToken];
}

module.exports = {
  add,
  get,
};
