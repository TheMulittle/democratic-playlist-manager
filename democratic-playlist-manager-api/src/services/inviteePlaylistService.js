const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const inviteeAssignments = require("../repositories/inviteeAssignments");
const invitations = require("../repositories/invitations");
const managedPlaylists = require("../repositories/managedPlaylists");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

function getAssignedPlaylists(sessionToken) {
  const { email } = sessions.get(sessionToken);
  const playlistIds = inviteeAssignments.getPlaylistIds(email);
  const playlists = playlistIds.map((playlistId) => {
    const invitation = invitations.getByPlaylistId(playlistId);
    return { playlistId, playlistName: invitation?.playlistName ?? playlistId };
  });
  return { playlists };
}

async function getPlaylistTracks(playlistId, sessionToken) {
  const hostToken = managedPlaylists.getHostTokenByPlaylistId(playlistId);
  if (!hostToken) {
    throw new ResourceNotFoundError(`No host found for playlist [${playlistId}]`);
  }

  const hostSession = sessions.get(hostToken);
  const spotifyApi = new SpotifyClientWrapper({ accessToken: hostSession.spotifyAccessToken });

  const inviteeSession = sessions.get(sessionToken);
  const currentTrackId = await spotifyApi.retrieveCurrentTrackId();
  const rawTracks = await spotifyApi.retrievePlaylistTracksWithDetails(playlistId);

  const tracks = rawTracks.map((item) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((a) => a.name).join(", "),
    addedBy: item.added_by.id,
    isOwn: item.added_by.id === inviteeSession.spotifyId,
    isCurrent: item.track.id === currentTrackId,
  }));

  return { tracks };
}

module.exports = { getAssignedPlaylists, getPlaylistTracks };
