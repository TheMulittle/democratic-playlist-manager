const managedPlaylists = {};
const PersistenceError = require("../errors/PersistenceError");

function add(refreshToken, playlistId, item) {
  if (typeof refreshToken !== "string") {
    throw new PersistenceError(
      `Unable to persist a playlist timer with refreshToken different than a string. Instead it was [${typeof refreshToken}]`
    );
  }

  if (!managedPlaylists[refreshToken]) {
    managedPlaylists[refreshToken] = new Map();
  }

  managedPlaylists[refreshToken].set(playlistId, { ...item });
}

function get(refreshToken, playlistId) {
  return managedPlaylists[refreshToken]?.get(playlistId) ?? undefined;
}

function getAllPlaylistIds(refreshToken) {
  return Array.from(managedPlaylists[refreshToken]?.keys() ?? []);
}

function remove(refreshToken, playlistId) {
  managedPlaylists[refreshToken].delete(playlistId);
}

module.exports = {
  add,
  get,
  remove,
  getAllPlaylistIds,
};
