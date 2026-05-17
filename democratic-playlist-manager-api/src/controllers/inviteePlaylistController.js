const inviteePlaylistService = require("../services/inviteePlaylistService");

async function getAssignedPlaylists(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await inviteePlaylistService.getAssignedPlaylists(token);
  res.status(200).json(result);
}

async function getPlaylistTracks(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await inviteePlaylistService.getPlaylistTracks(req.params.playlistId, token);
  res.status(200).json(result);
}

async function searchTracks(req, res) {
  const result = await inviteePlaylistService.searchTracks(req.params.playlistId, req.query.q);
  res.status(200).json(result);
}

async function addTrack(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  await inviteePlaylistService.addTrack(req.params.playlistId, req.body.trackUri, token);
  res.status(201).json({ message: "Track added" });
}

module.exports = { getAssignedPlaylists, getPlaylistTracks, searchTracks, addTrack };
