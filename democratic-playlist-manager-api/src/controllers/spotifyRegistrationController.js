const spotifyRegistrationService = require("../services/spotifyRegistrationService");
const ConflictError = require("../errors/ConflictError");

function initiateSpotifyRegistration(req, res) {
  res.redirect(spotifyRegistrationService.createAuthorizeURL());
}

async function spotifyRegistrationCallback(req, res) {
  const { code, error } = req.query;
  const webAppBase = process.env.WEB_APP_BASE_URL;

  if (error || !code) {
    return res.redirect(`${webAppBase}/register?error=spotify_auth_failed`);
  }

  try {
    const sessionToken = await spotifyRegistrationService.registerViaSpotify(code);
    res.cookie("DP_RFT", sessionToken, { httpOnly: true });
    return res.redirect(`${webAppBase}/playlist`);
  } catch (err) {
    const errorParam = err instanceof ConflictError ? "already_registered" : "registration_failed";
    return res.redirect(`${webAppBase}/register?error=${errorParam}`);
  }
}

module.exports = { initiateSpotifyRegistration, spotifyRegistrationCallback };
