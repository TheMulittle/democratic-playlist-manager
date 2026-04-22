const sessions = {};

function add(token, user) {
  sessions[token] = user;
}

function get(token) {
  return sessions[token];
}

function remove(token) {
  delete sessions[token];
}

module.exports = { add, get, remove };
