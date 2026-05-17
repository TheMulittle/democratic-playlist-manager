const SpotifyClientWrapper = require("../clients/SpotifyClientWrapper");
const sessions = require("../repositories/sessions");

async function getPlaylists(options, sessionToken) {
  const session = await sessions.get(sessionToken);
  const spotifyApi = new SpotifyClientWrapper({ accessToken: session.spotifyAccessToken });

  let userPlaylists = spotifyApi.retrieveUserPlaylists();

  if (options.mine === true || options.mine === false) {
    const userId = (await spotifyApi.retrieveCurrentUserProfile()).id;
    userPlaylists = (await userPlaylists).filter(
      (playlist) => (playlist.owner.id === userId) === options.mine
    );
  }

  if (options.collaborative === true || options.collaborative === false) {
    userPlaylists = (await userPlaylists).filter(
      (playlist) => playlist.collaborative === options.collaborative
    );
  }

  return { playlists: await userPlaylists };
}

module.exports = { getPlaylists };
