const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");
const spotifyTokens = require("../repositories/spotifyTokens");

async function getSpotifyClient(sessionToken) {
  const session = await sessions.get(sessionToken);
  return {
    client: new SpotifyClientWrapper({ accessToken: session.spotifyAccessToken }),
    email: session.email,
    refreshToken: session.spotifyRefreshToken,
  };
}

async function withRefresh(sessionToken, fn) {
  const { client, email, refreshToken } = await getSpotifyClient(sessionToken);
  try {
    return await fn(client);
  } catch (err) {
    if (err?.statusCode === 401 || err?.status === 401) {
      const refreshClient = new SpotifyClientWrapper({
        refreshToken,
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      });
      const data = await refreshClient.refreshToken();
      if (data?.access_token) {
        await spotifyTokens.updateAccessToken(email, data.access_token);
        const newClient = new SpotifyClientWrapper({ accessToken: data.access_token });
        return await fn(newClient);
      }
    }
    throw err;
  }
}

module.exports = { getSpotifyClient, withRefresh };
