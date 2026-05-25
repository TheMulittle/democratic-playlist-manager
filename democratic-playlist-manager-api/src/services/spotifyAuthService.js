const { nanoid } = require("nanoid");
const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const thirdPartyUsers = require("../repositories/thirdPartyUsers");
const sessions = require("../repositories/sessions");
const spotifyTokens = require("../repositories/spotifyTokens");

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

async function authenticateViaSpotify(code) {
  const client = new SpotifyClientWrapper(credentials);
  const accessData = await client.authenticate(code);

  if (!accessData || !accessData.access_token) {
    throw new Error("Spotify authentication failed");
  }

  const profileClient = new SpotifyClientWrapper({ accessToken: accessData.access_token });
  const profile = await profileClient.retrieveCurrentUserProfile();

  const providerKey = `spotify:${profile.id}`;
  let user = await thirdPartyUsers.get(providerKey);

  if (!user) {
    user = { providerKey, spotifyId: profile.id, email: profile.email };
    await thirdPartyUsers.add(providerKey, user);
  }

  await spotifyTokens.upsert(user.email, {
    accessToken: accessData.access_token,
    refreshToken: accessData.refresh_token,
  });

  const token = nanoid();
  await sessions.add(token, { email: user.email });

  return { token, userType: "host" };
}

module.exports = { createAuthorizeURL, authenticateViaSpotify };
