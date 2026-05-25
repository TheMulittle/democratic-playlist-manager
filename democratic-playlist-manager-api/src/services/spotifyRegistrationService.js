const { nanoid } = require("nanoid");
const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const thirdPartyUsers = require("../repositories/thirdPartyUsers");
const sessions = require("../repositories/sessions");
const spotifyTokens = require("../repositories/spotifyTokens");
const ConflictError = require("../errors/ConflictError");

const credentials = {
  redirectUri: process.env.SPOTIFY_REGISTRATION_CALLBACK,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
};

const scopes = ["user-read-private", "user-read-email"];

function createAuthorizeURL() {
  const client = new SpotifyClientWrapper(credentials);
  return client.createAuthorizeURL(scopes, null);
}

async function registerViaSpotify(code) {
  const client = new SpotifyClientWrapper(credentials);
  const accessData = await client.authenticate(code);

  if (!accessData || !accessData.access_token) {
    throw new Error("Spotify authentication failed");
  }

  const profileClient = new SpotifyClientWrapper({ accessToken: accessData.access_token });
  const profile = await profileClient.retrieveCurrentUserProfile();

  const providerKey = `spotify:${profile.id}`;

  if (await thirdPartyUsers.get(providerKey)) {
    throw new ConflictError("User already registered with this Spotify account");
  }

  const user = { providerKey, spotifyId: profile.id, email: profile.email };
  await thirdPartyUsers.add(providerKey, user);

  await spotifyTokens.upsert(user.email, {
    accessToken: accessData.access_token,
    refreshToken: accessData.refresh_token,
  });

  const sessionToken = nanoid();
  await sessions.add(sessionToken, { email: user.email });

  return { token: sessionToken, userType: "host" };
}

module.exports = { createAuthorizeURL, registerViaSpotify };
