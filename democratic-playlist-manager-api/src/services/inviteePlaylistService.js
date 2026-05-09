const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const inviteeAssignments = require("../repositories/inviteeAssignments");
const invitations = require("../repositories/invitations");
const managedPlaylists = require("../repositories/managedPlaylists");
const inviteeTrackOwnership = require("../repositories/inviteeTrackOwnership");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

function getHostClient(playlistId) {
  const hostToken = managedPlaylists.getHostTokenByPlaylistId(playlistId);
  if (!hostToken) throw new ResourceNotFoundError(`No host found for playlist [${playlistId}]`);
  const hostSession = sessions.get(hostToken);
  return new SpotifyClientWrapper({ accessToken: hostSession.spotifyAccessToken });
}

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
  const spotifyApi = getHostClient(playlistId);
  const inviteeSession = sessions.get(sessionToken);
  const currentTrackId = await spotifyApi.retrieveCurrentTrackId();
  const rawTracks = await spotifyApi.retrievePlaylistTracksWithDetails(playlistId);

  const tracks = rawTracks.map((item) => {
    const ownerEmail = inviteeTrackOwnership.getOwner(playlistId, item.track.id);
    const isOwn = ownerEmail
      ? ownerEmail === inviteeSession.email
      : item.added_by.id === inviteeSession.spotifyId;
    return {
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((a) => a.name).join(", "),
      addedBy: ownerEmail ?? item.added_by.id,
      isOwn,
      isCurrent: item.track.id === currentTrackId,
    };
  });

  return { tracks };
}

async function searchTracks(playlistId, query) {
  const spotifyApi = getHostClient(playlistId);
  const results = await spotifyApi.searchTracks(query);
  return {
    tracks: results.map((t) => ({
      id: t.id,
      uri: t.uri,
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
    })),
  };
}

async function addTrack(playlistId, trackUri, sessionToken) {
  const spotifyApi = getHostClient(playlistId);
  await spotifyApi.addTrackToPlaylist(playlistId, trackUri);
  const { email } = sessions.get(sessionToken);
  const trackId = trackUri.split(":")[2];
  inviteeTrackOwnership.add(playlistId, trackId, email);
}

module.exports = { getAssignedPlaylists, getPlaylistTracks, searchTracks, addTrack };
