/* eslint-env jest */
const playlistOrderingService = require("../../src/services/playlistOrderingService");
const spotifyPlaylistFixtures = require("../../__fixtures__/playlistItems.fixture");

describe("When ordering a playlist that has already a song playing, the algorithm should order tracks below the current playling song still taking into account the previous played songs. No ordering should happen when there isnt a song playing. In the tests * indicates the current playing song", () => {
  it("A playlist that doesnt have any songs yet should be sorted without throwing any exception ", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems();

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(playlist);

    expect(reorderedPlaylist).toStrictEqual([]);
  });

  it("A playlist [A1*] should become [A1*] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
    ]);
  });

  it("A playlist [A1*, A2, A3] should become [A1*, A2, A3] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "A2",
      "A3",
    ]);
  });

  it("A playlist [A1*, A2, B1] should become [A1*, B1, A2] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "A2" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "A2",
    ]);
  });

  it("A playlist [A1*, B1, B2, C1, C2, C3, A2] should become [A1*, B1, C1, A2, B2, C2] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "B2" },
      { trackId: "C1" },
      { trackId: "C2" },
      { trackId: "C3" },
      { trackId: "A2" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "C1",
      "A2",
      "B2",
      "C2",
      "C3",
    ]);
  });

  it("When there is a manually ordered playlist [A2*, A1, B2, B1], the playlist should become [A2*, B2, A1, B1] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A2", added_at: "2019-12-27T01:30:03Z" },
      { trackId: "A1", added_at: "2019-12-27T01:30:01Z" },
      { trackId: "B2", added_at: "2019-12-27T01:30:04Z" },
      { trackId: "B1", added_at: "2019-12-27T01:30:02Z" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A2",
      "B2",
      "A1",
      "B1",
    ]);
  });

  it("When there is a manually ordered playlist [*A1, C1, B1], the playlist should become [A1*, B1, C1] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1", added_at: "2019-12-27T01:30:01Z" },
      { trackId: "C1", added_at: "2019-12-27T01:30:03Z" },
      { trackId: "B1", added_at: "2019-12-27T01:30:02Z" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "C1",
    ]);
  });

  it("A playlist [A1, B1, A2*, C1] should become [A1, B1, A2*, C1] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "A2" },
      { trackId: "C1" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[3]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "A2",
      "C1",
    ]);
  });

  it("A playlist [A1, B1, A2*] should become [A1, B1, A2*] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "A2" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[3]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "A2",
    ]);
  });

  it("A playlist [A1, A2*, A3, B1] should become [A1, A2*, B1, A3] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
      { trackId: "B1" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[1]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "A2",
      "B1",
      "A3",
    ]);
  });

  it("A playlist [A1*, B1, B2, B3, A2] should become [A1*,B1, A2, B2, B3] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "B2" },
      { trackId: "B3" },
      { trackId: "A2" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      playlist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "B1",
      "A2",
      "B2",
      "B3",
    ]);
  });

  it("A playlist [A1, A2, A3, B1] whose owner is not playing any track should become [A1, A2, A3, B1] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
      { trackId: "B1" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      {}
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "A2",
      "A3",
      "B1",
    ]);
  });

  it("A playlist [A1, A2, A3, B1] whose owner is playing a track that does not belong to the plyalist should become [A1, A2, A3, B1] after reordering", async () => {
    const playlist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
      { trackId: "B1" },
    ]);
    const otherPlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "N1" },
    ]);

    const reorderedPlaylist = playlistOrderingService.definePlaylistTracksOrder(
      playlist,
      otherPlaylist[0]
    );

    expect(reorderedPlaylist.map((item) => item.track.id)).toStrictEqual([
      "A1",
      "A2",
      "A3",
      "B1",
    ]);
  });
});
