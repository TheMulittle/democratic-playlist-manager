const express = require("express");
const asyncHandler = require("express-async-handler");
const authenticationService = require("../services/spotifyAuthenticationService");
const UserNotAuthenticatedError = require("../errors/UserNotAuthenticatedError");
const index = require("../controllers/index");
const nativeRegistrationController = require("../controllers/nativeRegistrationController");

const router = express.Router();

router.post(
  "/users/register",
  asyncHandler(nativeRegistrationController.registerUser)
);

router.get("/secret-login", index.login);
router.get("/callback", index.callback);
router.get("/register", index.register);
router.get("/voteskip", index.voteskip);
// TODO  post and delete to be /orderer/playlist
// TODO delete to follow /playlist/{id}
// TODO addPlaylist and removePlaylist to be renamed to manage(unmanage)PlaylistOrdering
router.post(
  "/playlist/:playlistId",
  ensureSpotifyAuthentication,
  asyncHandler(index.addPlaylist)
);
router.get(
  "/playlist",
  ensureSpotifyAuthentication,
  asyncHandler(index.getManagedPlaylistsIds)
);
router.delete(
  "/playlist/:playlistId",
  ensureSpotifyAuthentication,
  asyncHandler(index.removePlaylist)
);
router.get(
  "/me/playlist",
  ensureSpotifyAuthentication,
  asyncHandler(index.getMyPlaylists)
);
router.post(
  "/trigger-reorder",
  ensureSpotifyAuthentication,
  asyncHandler(index.triggerReorder)
);

function ensureSpotifyAuthentication(req, res, next) {
  if (!authenticationService.isUserAuthenticated(req.cookies.DP_RFT)) {
    throw new UserNotAuthenticatedError();
  }
  return next();
}

module.exports = router;
