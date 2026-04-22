const express = require("express");
const asyncHandler = require("express-async-handler");
const UserNotAuthenticatedError = require("../errors/UserNotAuthenticatedError");
const index = require("../controllers/index");
const nativeRegistrationController = require("../controllers/nativeRegistrationController");
const spotifyRegistrationController = require("../controllers/spotifyRegistrationController");
const nativeLoginController = require("../controllers/nativeLoginController");
const spotifyLoginController = require("../controllers/spotifyLoginController");
const sessions = require("../repositories/sessions");

const router = express.Router();

// Registration
router.post("/users/register", asyncHandler(nativeRegistrationController.registerUser));
router.get("/users/register/spotify", spotifyRegistrationController.initiateSpotifyRegistration);
router.get("/users/register/spotify/callback", asyncHandler(spotifyRegistrationController.spotifyRegistrationCallback));

// Login / Logout
router.post("/users/login", asyncHandler(nativeLoginController.login));
router.post("/users/logout", nativeLoginController.logout);
router.get("/users/login/spotify", spotifyLoginController.initiateSpotifyLogin);
router.get("/users/login/spotify/callback", asyncHandler(spotifyLoginController.spotifyLoginCallback));

// Legacy Spotify playlist management routes (untouched)
router.get("/secret-login", index.login);
router.get("/callback", index.callback);
router.get("/register", index.register);
router.get("/voteskip", index.voteskip);

router.post("/playlist/:playlistId", ensureAuthentication, asyncHandler(index.addPlaylist));
router.get("/playlist", ensureAuthentication, asyncHandler(index.getManagedPlaylistsIds));
router.delete("/playlist/:playlistId", ensureAuthentication, asyncHandler(index.removePlaylist));
router.get("/me/playlist", ensureAuthentication, asyncHandler(index.getMyPlaylists));
router.post("/trigger-reorder", ensureAuthentication, asyncHandler(index.triggerReorder));

function ensureAuthentication(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.get(token)) {
    throw new UserNotAuthenticatedError();
  }
  return next();
}

module.exports = router;
