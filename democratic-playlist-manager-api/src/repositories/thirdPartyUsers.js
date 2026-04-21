const PersistenceError = require("../errors/PersistenceError");

const users = {};

function add(providerKey, user) {
  if (typeof providerKey !== "string") {
    throw new PersistenceError(
      `Unable to persist a third party user with providerKey different than a string. Instead it was [${typeof providerKey}]`
    );
  }
  users[providerKey] = user;
}

function get(providerKey) {
  return users[providerKey];
}

module.exports = { add, get };
