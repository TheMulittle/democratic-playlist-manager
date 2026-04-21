const sessions = {};

function add(token, user) {
  sessions[token] = user;
}

function get(token) {
  return sessions[token];
}

module.exports = { add, get };
