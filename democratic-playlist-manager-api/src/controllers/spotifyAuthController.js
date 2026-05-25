const spotifyAuthService = require("../services/spotifyAuthService");

function initiateSpotifyAuth(req, res) {
  res.redirect(spotifyAuthService.createAuthorizeURL());
}

async function spotifyAuthCallback(req, res) {
  const { code, error } = req.query;
  const webAppBase = process.env.WEB_APP_BASE_URL;

  if (error || !code) {
    return res.redirect(`${webAppBase}/login?error=spotify_auth_failed`);
  }

  try {
    const result = await spotifyAuthService.authenticateViaSpotify(code);
    return res.redirect(
      `${webAppBase}/login/spotify/callback?token=${result.token}&userType=${result.userType}`
    );
  } catch (err) {
    console.error("Spotify auth error:", err.message, err.stack);
    return res.redirect(`${webAppBase}/login?error=login_failed`);
  }
}

module.exports = { initiateSpotifyAuth, spotifyAuthCallback };
