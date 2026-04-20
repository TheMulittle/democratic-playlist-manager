const SpotifyWebApi = require("spotify-web-api-node");

class SpotifyClientWrapper {
  constructor(credentials) {
    this.spotifyApi = new SpotifyWebApi(credentials);
  }

  async authenticate(code) {
    const data = await this.spotifyApi
      .authorizationCodeGrant(code)
      .catch((err) => {
        console.log("Something went wrong!", err);
      });

    if (data) {
      console.log(data.body);
      return data.body;
    }

    console.log("Please Login");
    return ["", ""];
  }

  createAuthorizeURL(scopes, state) {
    return this.spotifyApi.createAuthorizeURL(scopes, state);
  }

  async retrievePlaylistTracks(playlistId) {
    let offsetCounter = 0;
    const tracksPerPage = 100;
    let tracksInfo = [];
    let tracksPage;

    do {
      tracksPage = await this.spotifyApi
        .getPlaylistTracks(playlistId, {
          offset: offsetCounter,
          limit: tracksPerPage,
          fields: "items(added_at, added_by.id, track(id)), total",
        })
        .then((data) => {
          tracksInfo = tracksInfo.concat(data.body.items);
          offsetCounter += tracksPerPage;
          return data.body;
        })
        .catch((err) => {
          console.error(
            `Error while retrieving playlist tracks!\nError:${err}`
          );
        });
    } while (tracksPage.total > offsetCounter);
    return tracksInfo;
  }

  retrievePlaylistSnapshotId(playlistId) {
    return this.spotifyApi
      .getPlaylist(playlistId, { fields: "snapshot_id" })
      .then((data) => data.body?.snapshot_id ?? "")
      .catch((err) => {
        console.error(
          `Error while retrieving playlist snapshotId!\nError:${err}`
        );
        return "";
      });
  }

  retrieveCurrentTrackId() {
    return this.spotifyApi
      .getMyCurrentPlaybackState()
      .then((data) => data.body.item?.id ?? "")
      .catch((err) => {
        console.error(
          `Error while getting User´s playback state!\nError:${err}`
        );
        return "";
      });
  }

  retrieveCurrentUserProfile() {
    return this.spotifyApi
      .getMe()
      .then((data) => data.body ?? {})
      .catch((err) => {
        console.error(`Error while getting User Profile!\nError:${err}`);
        return "";
      });
  }

  retrieveUserPlaylists() {
    return this.spotifyApi
      .getUserPlaylists({ limit: 50 })
      .then((data) => data.body?.items ?? [])
      .catch((err) => {
        console.error(`Error while retrieving User Playlists!\nError:${err}`);
        return [];
      });
  }

  async reorderTracksInPlaylist(
    playlistId,
    positionInCurentPlaylist,
    positionInOrderedPlaylist,
    options
  ) {
    console.log(
      `Moving ${positionInCurentPlaylist} to ${positionInOrderedPlaylist}`
    );
    try {
      const reply = await this.spotifyApi.reorderTracksInPlaylist(
        playlistId,
        positionInCurentPlaylist,
        positionInOrderedPlaylist,
        options
      );
      return reply?.body?.snapshot_id ?? "";
    } catch (err) {
      console.error(
        `Error while reordering Tracks in Playlists!\nError:${err}\nRetrying...`
      );
      await this.reorderTracksInPlaylist(
        playlistId,
        positionInCurentPlaylist,
        positionInOrderedPlaylist,
        options
      );
    }
  }

  refreshToken() {
    return this.spotifyApi
      .refreshAccessToken()
      .then((data) => data?.body ?? {})
      .catch((err) => {
        console.error(`Error while refreshing token!\nError:${err}`);
      });
  }
}

module.exports = SpotifyClientWrapper;
