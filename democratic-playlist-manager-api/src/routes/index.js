const express = require("express");
const asyncHandler = require("express-async-handler");
const UserNotAuthenticatedError = require("../errors/UserNotAuthenticatedError");
const index = require("../controllers/index");
const nativeRegistrationController = require("../controllers/nativeRegistrationController");
const spotifyRegistrationController = require("../controllers/spotifyRegistrationController");
const nativeLoginController = require("../controllers/nativeLoginController");
const spotifyLoginController = require("../controllers/spotifyLoginController");
const invitationController = require("../controllers/invitationController");
const inviteePlaylistController = require("../controllers/inviteePlaylistController");
const healthController = require("../controllers/healthController");
const playlistWebSocketService = require("../services/playlistWebSocketService");
const sessions = require("../repositories/sessions");

const router = express.Router();

router.get("/health", asyncHandler(healthController.healthCheck));

// Registration
router.post("/users/register", asyncHandler(nativeRegistrationController.registerUser));
router.get("/users/register/spotify", spotifyRegistrationController.initiateSpotifyRegistration);
router.get("/users/register/spotify/callback", asyncHandler(spotifyRegistrationController.spotifyRegistrationCallback));

// Login / Logout
router.post("/users/login", asyncHandler(nativeLoginController.login));
router.post("/users/logout", asyncHandler(nativeLoginController.logout));
router.get("/users/login/spotify", spotifyLoginController.initiateSpotifyLogin);
router.get("/users/login/spotify/callback", asyncHandler(spotifyLoginController.spotifyLoginCallback));

// Legacy Spotify playlist management routes (untouched)
router.get("/secret-login", index.login);
router.get("/callback", index.callback);
router.get("/register", index.register);
router.get("/voteskip", index.voteskip);

router.post("/playlist/:playlistId", asyncHandler(ensureAuthentication), asyncHandler(index.addPlaylist));
router.get("/playlist", asyncHandler(ensureAuthentication), asyncHandler(index.getManagedPlaylistsIds));
router.delete("/playlist/:playlistId", asyncHandler(ensureAuthentication), asyncHandler(index.removePlaylist));
router.get("/me/playlist", asyncHandler(ensureAuthentication), asyncHandler(index.getMyPlaylists));
router.post("/trigger-reorder", asyncHandler(ensureAuthentication), asyncHandler(index.triggerReorder));

// Invitations
router.post("/invitations", asyncHandler(ensureAuthentication), asyncHandler(invitationController.createInvitation));
router.get("/invitations/:playlistId/:inviteToken", asyncHandler(invitationController.getInvitation));
router.post("/invitations/:playlistId/:inviteToken/accept", asyncHandler(ensureAuthentication), asyncHandler(invitationController.acceptInvitation));
router.get("/me/invitee-playlists", asyncHandler(ensureAuthentication), asyncHandler(inviteePlaylistController.getAssignedPlaylists));
router.get("/me/invitee-playlists/:playlistId/tracks", asyncHandler(ensureAuthentication), asyncHandler(inviteePlaylistController.getPlaylistTracks));
router.get("/me/invitee-playlists/:playlistId/search", asyncHandler(ensureAuthentication), asyncHandler(inviteePlaylistController.searchTracks));
router.post("/me/invitee-playlists/:playlistId/tracks", asyncHandler(ensureAuthentication), asyncHandler(inviteePlaylistController.addTrack));

// WebSocket: live playlist tracking
router.ws("/me/invitee-playlists/:playlistId/live", async (ws, req) => {
  const token = req.query.token;
  const session = await playlistWebSocketService.authenticate(token);
  if (!session) {
    ws.close(4001, "Unauthorized");
    return;
  }
  playlistWebSocketService.subscribe(ws, req.params.playlistId, token);
});

async function ensureAuthentication(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !(await sessions.get(token))) {
    throw new UserNotAuthenticatedError();
  }
  return next();
}

module.exports = router;
