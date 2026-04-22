const spotifyLoginService = require("../services/spotifyLoginService");

function initiateSpotifyLogin(req, res) {
  res.redirect(spotifyLoginService.createAuthorizeURL());
}

async function spotifyLoginCallback(req, res) {
  const { code, error } = req.query;
  const webAppBase = process.env.WEB_APP_BASE_URL;

  if (error || !code) {
    return res.redirect(`${webAppBase}/login?error=spotify_auth_failed`);
  }

  try {
    const result = await spotifyLoginService.loginViaSpotify(code);
    return res.redirect(
      `${webAppBase}/login/spotify/callback?token=${result.token}&userType=${result.userType}`
    );
  } catch {
    return res.redirect(`${webAppBase}/login?error=login_failed`);
  }
}

module.exports = { initiateSpotifyLogin, spotifyLoginCallback };
