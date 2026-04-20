const PersistenceError = require("../errors/PersistenceError");

const users = {};

function add(email, user) {
  if (typeof email !== "string") {
    throw new PersistenceError(
      `Unable to persist a user with email different than a string. Instead it was [${typeof email}]`
    );
  }
  users[email] = user;
}

function get(email) {
  return users[email];
}

module.exports = { add, get };
