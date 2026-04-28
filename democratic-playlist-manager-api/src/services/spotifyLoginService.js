const { nanoid } = require("nanoid");
const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const thirdPartyUsers = require("../repositories/thirdPartyUsers");
const sessions = require("../repositories/sessions");
const GeneralError = require("../errors/GeneralError");

const credentials = {
  redirectUri: process.env.SPOTIFY_LOGIN_CALLBACK,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
};

const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-playback-state",
];

function createAuthorizeURL() {
  const client = new SpotifyClientWrapper(credentials);
  return client.createAuthorizeURL(scopes, null);
}

async function loginViaSpotify(code) {
  const client = new SpotifyClientWrapper(credentials);
  const accessData = await client.authenticate(code);

  if (!accessData || !accessData.access_token) {
    throw new GeneralError("Spotify authentication failed", 401);
  }

  const profileClient = new SpotifyClientWrapper({ accessToken: accessData.access_token });
  const profile = await profileClient.retrieveCurrentUserProfile();

  const user = thirdPartyUsers.get(`spotify:${profile.id}`);
  if (!user) {
    throw new GeneralError("No account found for this Spotify user", 401);
  }

  const token = nanoid();
  sessions.add(token, { ...user, userType: "host", spotifyAccessToken: accessData.access_token, spotifyRefreshToken: accessData.refresh_token });
  return { token, userType: "host" };
}

module.exports = { createAuthorizeURL, loginViaSpotify };
