function generatePlaybackState(currentSongId) {
  return {
    body: {
      device: {
        id: "1291a4cfe3682b1dcbddb203e6985f9190d59e66",
        is_active: true,
        is_private_session: false,
        is_restricted: false,
        name: "Web Player (Chrome)",
        type: "Computer",
        volume_percent: 100,
      },
      shuffle_state: false,
      repeat_state: "context",
      timestamp: 1615393184983,
      context: {
        external_urls: {
          spotify: "https://open.spotify.com/playlist/54xgV63i1QX8RU3bhGbJfM",
        },
        href: "https://api.spotify.com/v1/playlists/54xgV63i1QX8RU3bhGbJfM",
        type: "playlist",
        uri: "spotify:playlist:54xgV63i1QX8RU3bhGbJfM",
      },
      progress_ms: 2234,
      item: {
        album: {
          album_type: "album",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/4gwpcMTbLWtBUlOijbVpuu",
              },
              href: "https://api.spotify.com/v1/artists/4gwpcMTbLWtBUlOijbVpuu",
              id: "4gwpcMTbLWtBUlOijbVpuu",
              name: "Capital Cities",
              type: "artist",
              uri: "spotify:artist:4gwpcMTbLWtBUlOijbVpuu",
            },
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/3WrufJir7I61NkvkDwxero",
          },
          href: "https://api.spotify.com/v1/albums/3WrufJir7I61NkvkDwxero",
          id: "3WrufJir7I61NkvkDwxero",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b27313c6cb6a81c8db4dbc8b9924",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e0213c6cb6a81c8db4dbc8b9924",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d0000485113c6cb6a81c8db4dbc8b9924",
              width: 64,
            },
          ],
          name: "In A Tidal Wave Of Mystery (Deluxe Edition)",
          release_date: "2013",
          release_date_precision: "year",
          total_tracks: 16,
          type: "album",
          uri: "spotify:album:3WrufJir7I61NkvkDwxero",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/4gwpcMTbLWtBUlOijbVpuu",
            },
            href: "https://api.spotify.com/v1/artists/4gwpcMTbLWtBUlOijbVpuu",
            id: "4gwpcMTbLWtBUlOijbVpuu",
            name: "Capital Cities",
            type: "artist",
            uri: "spotify:artist:4gwpcMTbLWtBUlOijbVpuu",
          },
        ],
        disc_number: 1,
        duration_ms: 192789,
        explicit: false,
        external_ids: {
          isrc: "USCA21203108",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/6Z8R6UsFuGXGtiIxiD8ISb",
        },
        href: "https://api.spotify.com/v1/tracks/6Z8R6UsFuGXGtiIxiD8ISb",
        id: currentSongId,
        is_local: false,
        is_playable: true,
        name: "Safe And Sound",
        popularity: 80,
        preview_url:
          "https://p.scdn.co/mp3-preview/9100a200837a871f6f1c2cda42b2b5749cf9f11f?cid=774b29d4f13844c495f206cafdad9c86",
        track_number: 1,
        type: "track",
        uri: "spotify:track:6Z8R6UsFuGXGtiIxiD8ISb",
      },
      currently_playing_type: "track",
      actions: {
        disallows: {
          pausing: true,
        },
      },
      is_playing: false,
    },
  };
}

module.exports.generatePlaybackState = generatePlaybackState;
