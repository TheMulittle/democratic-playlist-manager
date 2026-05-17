const globalVariables = require("../globals/variables");

const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const playlistOrderingService = require("./playlistOrderingService");
const playlistMovementCalculator = require("./playlistMovementCalculator");
const inviteeTrackOwnership = require("../repositories/inviteeTrackOwnership");

const ResourceDoesNotBelongToEntityError = require("../errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

const managedPlaylists = require("../repositories/managedPlaylists");

const AsyncLock = require("async-lock");
const lock = new AsyncLock();

async function getSpotifyClient(sessionToken) {
  const session = await sessions.get(sessionToken);
  return new SpotifyClientWrapper({ accessToken: session.spotifyAccessToken });
}

async function reorderPlaylistOnSpotify(playlistId, sessionToken) {
  const spotifyAuthenticatedClient = await getSpotifyClient(sessionToken);
  let currentPlaylistTracks =
    spotifyAuthenticatedClient.retrievePlaylistTracks(playlistId);
  let currentTrackId = spotifyAuthenticatedClient.retrieveCurrentTrackId();
  let playlistSnapshotId =
    spotifyAuthenticatedClient.retrievePlaylistSnapshotId(playlistId);
  [currentPlaylistTracks, currentTrackId] = await Promise.all([
    currentPlaylistTracks,
    currentTrackId,
  ]).catch((err) => {
    throw err;
  });

  const ownersMap = await Promise.all(
    currentPlaylistTracks.map((t) => inviteeTrackOwnership.getOwner(playlistId, t.track.id))
  );
  const mappedTracks = currentPlaylistTracks.map((t, i) => {
    const owner = ownersMap[i];
    return owner ? { ...t, added_by: { id: owner } } : t;
  });

  const currentTrack = mappedTracks.find((t) => t.track.id === currentTrackId) ?? {};

  const reorderedPlaylistTracks = playlistOrderingService.definePlaylistTracksOrder(
    mappedTracks,
    currentTrack
  );
  const movements = playlistMovementCalculator.getPlaylistReorderMovements(
    mappedTracks,
    reorderedPlaylistTracks
  );

  for (const movement of movements) {
    playlistSnapshotId = spotifyAuthenticatedClient.reorderTracksInPlaylist(
      playlistId,
      movement.from,
      movement.to,
      { snapshot_id: await playlistSnapshotId }
    );
  }
}

async function getManagedPlaylistsIds(sessionToken) {
  return { playlistIds: await managedPlaylists.getAllPlaylistIds(sessionToken) };
}

function reorderPlaylist(playlistId, sessionToken) {
  if (lock.isBusy(playlistId) === false) {
    lock.acquire(playlistId, function () {
      return module.exports.reorderPlaylistOnSpotify(playlistId, sessionToken);
    });
  }
}

async function managePlaylist(playlistId, sessionToken) {
  await module.exports.validatePlaylistBelongsToUser(playlistId, sessionToken);
  const timer = setInterval(() => {
    module.exports.reorderPlaylist(playlistId, sessionToken);
  }, globalVariables.ORDER_PLAYLIST_INTERVAL);

  await managedPlaylists.add(sessionToken, playlistId, { timer });
}

async function unmanagePlaylist(playlistId, sessionToken) {
  await module.exports.validatePlaylistBelongsToUser(playlistId, sessionToken);
  await module.exports.validatePlaylistIsRegistred(playlistId, sessionToken);

  clearInterval(managedPlaylists.get(sessionToken, playlistId));
  managedPlaylists.remove(sessionToken, playlistId);
}

async function validatePlaylistBelongsToUser(playlistId, sessionToken) {
  const spotifyAuthenticatedClient = await getSpotifyClient(sessionToken);
  const userPlaylists = spotifyAuthenticatedClient.retrieveUserPlaylists();
  const userId = (await spotifyAuthenticatedClient.retrieveCurrentUserProfile()).id;
  const playlistBelongsToUser = (await userPlaylists).some(
    (playlist) => playlist.id === playlistId && playlist.owner.id === userId
  );
  if (!playlistBelongsToUser) {
    throw new ResourceDoesNotBelongToEntityError(playlistId, userId);
  }
}

async function validatePlaylistIsRegistred(playlistId, sessionToken) {
  if (!managedPlaylists.get(sessionToken, playlistId)) {
    throw new ResourceNotFoundError(
      `The given playlist [${playlistId}] was never added`
    );
  }
}

module.exports = {
  reorderPlaylist,
  reorderPlaylistOnSpotify,
  managePlaylist,
  unmanagePlaylist,
  getManagedPlaylistsIds,
  validatePlaylistBelongsToUser,
  validatePlaylistIsRegistred,
};
