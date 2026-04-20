const voteSkipService = require("../services/voteSkipService");
const spotifyAuthenticationService = require("../services/spotifyAuthenticationService");
const spotifyPlaylistManagementService = require("../services/playlistManagementService");
const currentUserProfileService = require("../services/currentUserProfileService");

// TODO: Have multiple controllers

function login(req, res) {
  res.redirect(spotifyAuthenticationService.createAuthorizeURL());
}

async function callback(req, res) {
  const authenticationData = await spotifyAuthenticationService.authenticate(
    req.query.code
  );
  res.cookie("DP_RFT", authenticationData.refreshToken);
  res.redirect(`${process.env.WEB_APP_BASE_URL}/playlist`);
}

function register(req, res) {
  res.statusCode = voteSkipService.registerDevice(req.header("deviceId"))
    ? 200
    : 201;

  res.send();
}

function voteskip(req, res) {
  if (voteSkipService.registerVote(req.header("deviceId"))) {
    res.statusCode = 200;
    res.json({ message: "Vote skip succesfuly registred" });
  } else {
    res.statusCode = 401;
    res.json({ message: "Device not registred" });
  }

  res.send();
}

// TODO cookie as first argument
async function addPlaylist(req, res) {
  await spotifyPlaylistManagementService.managePlaylist(
    req.params.playlistId,
    req.cookies.DP_RFT
  );
  res.statusCode = 201;
  res.json({ message: "Playlist Added" });
  res.send();
}

async function removePlaylist(req, res) {
  await spotifyPlaylistManagementService.unmanagePlaylist(
    req.params.playlistId,
    req.cookies.DP_RFT
  );
  res.statusCode = 200;
  res.json({ message: "Playlist Removed" });
  res.send();
}

function getManagedPlaylistsIds(req, res) {
  const managedPlaylists =
    spotifyPlaylistManagementService.getManagedPlaylistsIds(req.cookies.DP_RFT);
  res.statusCode = 200;
  res.json(managedPlaylists);
}

async function getMyPlaylists(req, res) {
  const userPlaylists = await currentUserProfileService.getPlaylists(
    req.query,
    req.cookies.DP_RFT
  );
  res.statusCode = 200;
  res.json(userPlaylists);
}

function triggerReorder(req, res) {
  const managedPlaylists =
    spotifyPlaylistManagementService.getManagedPlaylistsIds(req.cookies.DP_RFT);
  console.log(`managedPlaylists ${JSON.stringify(managedPlaylists)}`);
  const { playlistIds } = managedPlaylists;
  if (playlistIds.length > 0) {
    res.statusCode = 200;
    res.json({ message: "Reorder triggered" });
    playlistIds.forEach((playlistId) => {
      console.log(`reordering ${playlistId}`);
      spotifyPlaylistManagementService.reorderPlaylist(
        playlistId,
        req.cookies.DP_RFT
      );
    });
  }

  res.statusCode = 400;
  res.json({ message: "No managed playlists found" });
}

module.exports = {
  login,
  callback,
  voteskip,
  register,
  addPlaylist,
  removePlaylist,
  getManagedPlaylistsIds,
  getMyPlaylists,
  triggerReorder,
};
