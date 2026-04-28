const globalVariables = require("../globals/variables");

const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const playlistOrderingService = require("./playlistOrderingService");
const playlistMovementCalculator = require("./playlistMovementCalculator");

const ResourceDoesNotBelongToEntityError = require("../errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");

const managedPlaylists = require("../repositories/managedPlaylists");

const AsyncLock = require("async-lock");
const lock = new AsyncLock();

function getSpotifyClient(sessionToken) {
  const session = sessions.get(sessionToken);
  return new SpotifyClientWrapper({ accessToken: session.spotifyAccessToken });
}

async function reorderPlaylistOnSpotify(playlistId, sessionToken) {
  const spotifyAuthenticatedClient = getSpotifyClient(sessionToken);
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
  const currentTrack =
    currentPlaylistTracks.find(
      (trackInfo) => trackInfo.track.id === currentTrackId
    ) ?? {};

  const reorderedPlaylistTracks = playlistOrderingService.definePlaylistTracksOrder(
    currentPlaylistTracks,
    currentTrack
  );
  const movements = playlistMovementCalculator.getPlaylistReorderMovements(
    currentPlaylistTracks,
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

function getManagedPlaylistsIds(sessionToken) {
  return { playlistIds: managedPlaylists.getAllPlaylistIds(sessionToken) };
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

  managedPlaylists.add(sessionToken, playlistId, { timer });
}

async function unmanagePlaylist(playlistId, sessionToken) {
  await module.exports.validatePlaylistBelongsToUser(playlistId, sessionToken);
  await module.exports.validatePlaylistIsRegistred(playlistId, sessionToken);

  clearInterval(managedPlaylists.get(sessionToken, playlistId));
  managedPlaylists.remove(sessionToken, playlistId);
}

async function validatePlaylistBelongsToUser(playlistId, sessionToken) {
  const spotifyAuthenticatedClient = getSpotifyClient(sessionToken);
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
