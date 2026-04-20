const spotifyAuthenticationService = require("./spotifyAuthenticationService");

async function getPlaylists(options, refreshToken) {
  const spotifyApi =
    await spotifyAuthenticationService.provideAuthenticatedClient(refreshToken);
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

module.exports = {
  getPlaylists,
};
