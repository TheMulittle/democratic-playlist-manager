/* eslint-env jest */
const playlistMovementCalculator = require("../../src/services/playlistMovementCalculator");
const spotifyPlaylistFixtures = require("../../__fixtures__/playlistItems.fixture");

describe("Movements should be calculated based on the current playlist and the ordered playlist", () => {
  it("The movement calculation for a playlist that doesnt have any songs should return empty array of movements ", async () => {
    const actualPlaylist = spotifyPlaylistFixtures.generatePlaylistItems();
    const toBePlaylist = spotifyPlaylistFixtures.generatePlaylistItems();

    const calculatedMovements =
      playlistMovementCalculator.getPlaylistReorderMovements(
        actualPlaylist,
        toBePlaylist
      );

    expect(calculatedMovements).toStrictEqual([]);
  });

  it("The movement calculation for a playlist that have only one song should return empty array of movements", async () => {
    const actualPlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
    ]);
    const toBePlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
    ]);

    const calculatedMovements =
      playlistMovementCalculator.getPlaylistReorderMovements(
        actualPlaylist,
        toBePlaylist
      );

    expect(calculatedMovements.map((item) => item.track.id)).toStrictEqual([]);
  });

  it("The movement calculation for a [A1, A2, B1] that needs to become [A1, A2, B1] should be []", async () => {
    const actualPlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
    ]);
    const toBePlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "A3" },
    ]);

    const calculatedMovements =
      playlistMovementCalculator.getPlaylistReorderMovements(
        actualPlaylist,
        toBePlaylist
      );

    expect(calculatedMovements.map((item) => item.track.id)).toStrictEqual([]);
  });

  it("The movement calculation for a [B1, A1] that needs to become [A1, B1] should be [{1,0}]", async () => {
    const actualPlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "B1" },
      { trackId: "A1" },
    ]);
    const toBePlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
    ]);

    const calculatedMovements =
      playlistMovementCalculator.getPlaylistReorderMovements(
        actualPlaylist,
        toBePlaylist
      );

    expect(calculatedMovements).toStrictEqual([{ from: 1, to: 0 }]);
  });

  it("The movement calculation for a [A1, A2, B1, A3, B2] that needs to become [A1, B1, A2, B2, A3] should be [{2,1},{4,3}]", async () => {
    const actualPlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "B1" },
      { trackId: "A3" },
      { trackId: "B2" },
    ]);
    const toBePlaylist = spotifyPlaylistFixtures.generatePlaylistItems([
      { trackId: "A1" },
      { trackId: "B1" },
      { trackId: "A2" },
      { trackId: "B2" },
      { trackId: "A3" },
    ]);

    const calculatedMovements =
      playlistMovementCalculator.getPlaylistReorderMovements(
        actualPlaylist,
        toBePlaylist
      );

    expect(calculatedMovements).toStrictEqual([
      { from: 2, to: 1 },
      { from: 4, to: 3 },
    ]);
  });
});
