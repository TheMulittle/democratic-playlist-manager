const inviteePlaylistService = require("../services/inviteePlaylistService");

function getAssignedPlaylists(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const result = inviteePlaylistService.getAssignedPlaylists(token);
  res.status(200).json(result);
}

async function getPlaylistTracks(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const { playlistId } = req.params;
  const result = await inviteePlaylistService.getPlaylistTracks(playlistId, token);
  res.status(200).json(result);
}

module.exports = { getAssignedPlaylists, getPlaylistTracks };
