// keyed by `${playlistId}:${trackId}` → email
const ownership = {};

function add(playlistId, trackId, email) {
  ownership[`${playlistId}:${trackId}`] = email;
}

function getOwner(playlistId, trackId) {
  return ownership[`${playlistId}:${trackId}`];
}

module.exports = { add, getOwner };
