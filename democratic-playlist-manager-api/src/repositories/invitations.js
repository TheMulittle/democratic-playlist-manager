const invitations = {};

function add(inviteToken, playlistId, playlistName) {
  invitations[inviteToken] = { playlistId, playlistName };
}

function get(inviteToken) {
  return invitations[inviteToken];
}

function getByPlaylistId(playlistId) {
  return Object.values(invitations).find((inv) => inv.playlistId === playlistId);
}

module.exports = { add, get, getByPlaylistId };
