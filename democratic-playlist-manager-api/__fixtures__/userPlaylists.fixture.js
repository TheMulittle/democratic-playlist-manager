function generateUserPlaylist(userPlaylist) {
  return {
    collaborative: userPlaylist.collaborative ?? true,
    description: userPlaylist.name ?? "",
    external_urls: {
      spotify: "https://open.spotify.com/playlist/4RgMHPUyn3vMxPRtuLHMlp",
    },
    href: "https://api.spotify.com/v1/playlists/4RgMHPUyn3vMxPRtuLHMlp",
    id: userPlaylist.playlistId,
    images: [
      {
        height: 640,
        url: "https://mosaic.scdn.co/640/ab67616d0000b2730ba19a7d8fe4779b829a7951ab67616d0000b2732dac7a01676ddb36c1d0ec05ab67616d0000b273d46cb4df89f44f370e83d8cdab67616d0000b273ec369fcac01dd56a400f7980",
        width: 640,
      },
      {
        height: 300,
        url: "https://mosaic.scdn.co/300/ab67616d0000b2730ba19a7d8fe4779b829a7951ab67616d0000b2732dac7a01676ddb36c1d0ec05ab67616d0000b273d46cb4df89f44f370e83d8cdab67616d0000b273ec369fcac01dd56a400f7980",
        width: 300,
      },
      {
        height: 60,
        url: "https://mosaic.scdn.co/60/ab67616d0000b2730ba19a7d8fe4779b829a7951ab67616d0000b2732dac7a01676ddb36c1d0ec05ab67616d0000b273d46cb4df89f44f370e83d8cdab67616d0000b273ec369fcac01dd56a400f7980",
        width: 60,
      },
    ],
    name: userPlaylist.playlistId,
    owner: {
      display_name: userPlaylist.userId,
      external_urls: {
        spotify: "https://open.spotify.com/user/xxxxxx",
      },
      href: "https://api.spotify.com/v1/users/xxxxxxxx",
      id: userPlaylist.userId,
      type: "user",
      uri: `spotify:user:${userPlaylist.userId}`,
    },
    primary_color: null,
    public: userPlaylist.public ?? false,
    snapshot_id: "MTMyMSxhYTdjY2QzMmIxOGRlYTAwMjUyMDY3NjA2OTMzYTVhYzcyZjkyZDY0",
    tracks: {
      href: "https://api.spotify.com/v1/playlists/4RgMHPUyn3vMxPRtuLHMlp/tracks",
      total: 580,
    },
    type: "playlist",
    uri: `spotify:playlist:${userPlaylist.playlistId}`,
  };
}

function generateUserPlaylistsItem(usersPlaylists) {
  return usersPlaylists.map(generateUserPlaylist);
}

module.exports = {
  generateUserPlaylistsItem,
  generateUserPlaylist,
};
