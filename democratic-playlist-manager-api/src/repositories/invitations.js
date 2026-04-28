const invitations = {};

function add(inviteToken, playlistId, playlistName) {
  invitations[inviteToken] = { playlistId, playlistName };
}

function get(inviteToken) {
  return invitations[inviteToken];
}

module.exports = { add, get };
