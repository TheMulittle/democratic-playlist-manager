const assignments = {};

function add(email, playlistId) {
  if (!assignments[email]) {
    assignments[email] = new Set();
  }
  assignments[email].add(playlistId);
}

function getPlaylistIds(email) {
  return Array.from(assignments[email] ?? []);
}

module.exports = { add, getPlaylistIds };
