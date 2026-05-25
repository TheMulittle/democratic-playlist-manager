const { withRefresh } = require("./spotifyClientFactory");

async function getPlaylists(options, sessionToken) {
  return withRefresh(sessionToken, async (spotifyApi) => {
    let userPlaylists = await spotifyApi.retrieveUserPlaylists();

    if (options.mine === true || options.mine === false) {
      const userId = (await spotifyApi.retrieveCurrentUserProfile()).id;
      userPlaylists = userPlaylists.filter(
        (playlist) => (playlist.owner.id === userId) === options.mine
      );
    }

    if (options.collaborative === true || options.collaborative === false) {
      userPlaylists = userPlaylists.filter(
        (playlist) => playlist.collaborative === options.collaborative
      );
    }

    return { playlists: userPlaylists };
  });
}

module.exports = { getPlaylists };
