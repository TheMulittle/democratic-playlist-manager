const authenticatedUsers = require("../repositories/authenticatedUsers");

const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");

const TEN_MINUTES_MS = 600 * 1000;

const credentials = {
  redirectUri: process.env.SPOTIFY_CALLBACK,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
};

const scopes = [
  "user-read-private",
  "user-read-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
];

const state = null;

async function authenticate(code) {
  const spotifyApi = new SpotifyClientWrapper(credentials);
  const accessData = await spotifyApi.authenticate(code);

  const renovationTimestamp = calculateTokenRenovationTime(
    accessData.expires_in
  );

  const authenticatedUser = {
    accessToken: accessData.access_token,
    refreshToken: accessData.refresh_token,
    renovationTimestamp,
  };

  authenticatedUsers.add(accessData.refresh_token, authenticatedUser);
  return authenticatedUser;
}

function calculateTokenRenovationTime(expiresIn) {
  return new Date(Date.now() + expiresIn * 1000 - TEN_MINUTES_MS).toISOString();
}

function createAuthorizeURL() {
  const spotifyApi = new SpotifyClientWrapper(credentials);
  return spotifyApi.createAuthorizeURL(scopes, state);
}

function isUserAuthenticated(refreshToken) {
  return !!authenticatedUsers.get(refreshToken);
}

async function provideAuthenticatedClient(refreshToken) {
  const authenticatedUser = authenticatedUsers.get(refreshToken);
  if (Date.now() >= new Date(authenticatedUser.renovationTimestamp).getTime()) {
    const spotifyApiClient = new SpotifyClientWrapper({
      ...credentials,
      refreshToken: authenticatedUser.refreshToken,
    });
    const newTokenInfo = await spotifyApiClient.refreshToken();
    authenticatedUser.accessToken = newTokenInfo.access_token;
    authenticatedUser.renovationTimestamp = calculateTokenRenovationTime(
      newTokenInfo.expires_in
    );
    authenticatedUsers.add(authenticatedUser.refreshToken, authenticatedUser);
  }
  return new SpotifyClientWrapper(authenticatedUser);
}

module.exports = {
  authenticate,
  createAuthorizeURL,
  provideAuthenticatedClient,
  isUserAuthenticated,
};
