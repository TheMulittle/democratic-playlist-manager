const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const inviteeAssignments = require("../repositories/inviteeAssignments");
const invitations = require("../repositories/invitations");
const managedPlaylists = require("../repositories/managedPlaylists");
const inviteeTrackOwnership = require("../repositories/inviteeTrackOwnership");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

async function getHostClient(playlistId) {
  const hostToken = await managedPlaylists.getHostTokenByPlaylistId(playlistId);
  if (!hostToken) throw new ResourceNotFoundError(`No host found for playlist [${playlistId}]`);
  const hostSession = await sessions.get(hostToken);
  return new SpotifyClientWrapper({ accessToken: hostSession.spotifyAccessToken });
}

async function getAssignedPlaylists(sessionToken) {
  const { email } = await sessions.get(sessionToken);
  const playlistIds = await inviteeAssignments.getPlaylistIds(email);
  const playlists = await Promise.all(
    playlistIds.map(async (playlistId) => {
      const invitation = await invitations.getByPlaylistId(playlistId);
      return { playlistId, playlistName: invitation?.playlistName ?? playlistId };
    })
  );
  return { playlists };
}

async function getPlaylistTracks(playlistId, sessionToken) {
  const spotifyApi = await getHostClient(playlistId);
  const inviteeSession = await sessions.get(sessionToken);
  const currentTrackId = await spotifyApi.retrieveCurrentTrackId();
  const rawTracks = await spotifyApi.retrievePlaylistTracksWithDetails(playlistId);

  const tracks = await Promise.all(
    rawTracks.map(async (item) => {
      const ownerEmail = await inviteeTrackOwnership.getOwner(playlistId, item.track.id);
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
    })
  );

  return { tracks };
}

async function searchTracks(playlistId, query) {
  const spotifyApi = await getHostClient(playlistId);
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
  const spotifyApi = await getHostClient(playlistId);
  await spotifyApi.addTrackToPlaylist(playlistId, trackUri);
  const { email } = await sessions.get(sessionToken);
  const trackId = trackUri.split(":")[2];
  await inviteeTrackOwnership.add(playlistId, trackId, email);
}

module.exports = { getAssignedPlaylists, getPlaylistTracks, searchTracks, addTrack };
