/* eslint-env jest */
const AsyncLock = require("async-lock/lib");

const globalVariables = require("../../src/globals/variables");

const playlistManagementService = require("../../src/services/playlistManagementService");

jest.mock("../../src/services/playlistOrderingService");
const mockPlaylistOrderingService = require("../../src/services/playlistOrderingService");

jest.mock("../../src/services/playlistMovementCalculator");
const mockPlaylistMovementCalculator = require("../../src/services/playlistMovementCalculator");

jest.mock("../../src/clients/SpotifyClientWrapper");
const MockSpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

const mockProvideAuthentication = jest
  .fn()
  .mockImplementation(() => new MockSpotifyClientWrapper());
const mockSpotifyAuthenticationService = require("../../src/services/spotifyAuthenticationService.js");

mockSpotifyAuthenticationService.provideAuthenticatedClient =
  mockProvideAuthentication;

jest.mock("../../src/repositories/managedPlaylists.js");
const mockManagedPlaylist = require("../../src/repositories/managedPlaylists.js");

const playlistItemsFixture = require("../../__fixtures__/playlistItems.fixture");
const userPlaylistsFixture = require("../../__fixtures__/userPlaylists.fixture");
const currentUserProfileFixture = require("../../__fixtures__/currentUserProfile.fixture");
const sleep = require("../../__fixtures__/utils/sleep");

const ResourceDoesNotBelongToEntityError = require("../../src/errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../../src/errors/ResourceNotFoundError");

function setupSpotifyClientWrapperMock(mocks) {
  MockSpotifyClientWrapper.mockImplementation(() => ({ ...mocks }));
}

describe("Spotify Reorder Endpoint should be called once for each calculated movement", () => {
  it("Spotify Reorder Endpoint should not be called for a playlist that leads to no movement", async () => {
    // Arrange
    const playlistItems = [{ trackId: "A1" }];
    const playlistTracks =
      playlistItemsFixture.generatePlaylistItems(playlistItems);

    const mocks = {
      retrievePlaylistTracks: jest.fn().mockResolvedValue(playlistTracks),
      retrieveCurrentTrackId: jest.fn().mockResolvedValue("A1"),
      retrievePlaylistSnapshotId: jest.fn().mockResolvedValue("S1"),
      reorderTracksInPlaylist: jest.fn(),
      currentPlaylistTracks: jest.fn(),
    };
    setupSpotifyClientWrapperMock(mocks);

    jest
      .spyOn(mockPlaylistOrderingService, "definePlaylistTracksOrder")
      .mockImplementation(() => ["A1"]);
    jest
      .spyOn(mockPlaylistMovementCalculator, "getPlaylistReorderMovements")
      .mockImplementation(() => []);
    // Act
    await playlistManagementService.reorderPlaylistOnSpotify("P1");

    // Assert
    expect(mocks.reorderTracksInPlaylist).toHaveBeenCalledTimes(0);
  });

  it("Spotify Reorder Tracks In Playlist should be called for each calculated movement - 1 movement", async () => {
    // Arrange
    const playlistItems = [
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "B1" },
    ];
    const playlistTracks =
      playlistItemsFixture.generatePlaylistItems(playlistItems);

    const reorderedItems = [
      playlistTracks[0],
      playlistTracks[2],
      playlistTracks[1],
    ];
    const mocks = {
      retrievePlaylistTracks: jest.fn().mockResolvedValue(playlistTracks),
      retrieveCurrentTrackId: jest.fn().mockResolvedValue("A1"),
      retrievePlaylistSnapshotId: jest.fn().mockResolvedValue("S1"),
      reorderTracksInPlaylist: jest.fn(),
    };
    setupSpotifyClientWrapperMock(mocks);

    jest
      .spyOn(mockPlaylistOrderingService, "definePlaylistTracksOrder")
      .mockImplementation(() => reorderedItems);
    jest
      .spyOn(mockPlaylistMovementCalculator, "getPlaylistReorderMovements")
      .mockImplementation(() => [{ from: 2, to: 1 }]);

    // Act
    await playlistManagementService.reorderPlaylistOnSpotify("P1");

    // Assert
    expect(
      mockPlaylistOrderingService.definePlaylistTracksOrder
    ).toHaveBeenCalledWith(playlistTracks, playlistTracks[0]);
    expect(
      mockPlaylistMovementCalculator.getPlaylistReorderMovements
    ).toHaveBeenCalledWith(playlistTracks, reorderedItems);
    expect(mocks.reorderTracksInPlaylist).toHaveBeenCalledTimes(1);
    expect(mocks.reorderTracksInPlaylist).toHaveBeenNthCalledWith(
      1,
      "P1",
      2,
      1,
      { snapshot_id: "S1" }
    );
  });

  it("Spotify Reorder Tracks In Playlist should be called for each calculated movement - 2 movements", async () => {
    // Arrange
    const playlistItems = [
      { trackId: "A1" },
      { trackId: "A2" },
      { trackId: "B1" },
      { trackId: "A3" },
      { trackId: "B2" },
    ];
    const playlistTracks =
      playlistItemsFixture.generatePlaylistItems(playlistItems);

    const reorderedItems = [
      playlistTracks[0],
      playlistTracks[2],
      playlistTracks[1],
      playlistTracks[4],
      playlistTracks[3],
    ];
    const mocks = {
      retrievePlaylistTracks: jest.fn().mockResolvedValue(playlistTracks),
      retrieveCurrentTrackId: jest.fn().mockResolvedValue("A1"),
      retrievePlaylistSnapshotId: jest.fn().mockResolvedValue("S1"),
      reorderTracksInPlaylist: jest.fn().mockResolvedValue("S2"),
    };

    setupSpotifyClientWrapperMock(mocks);
    jest
      .spyOn(mockPlaylistOrderingService, "definePlaylistTracksOrder")
      .mockImplementation(() => reorderedItems);
    jest
      .spyOn(mockPlaylistMovementCalculator, "getPlaylistReorderMovements")
      .mockImplementation(() => [
        { from: 2, to: 1 },
        { from: 4, to: 3 },
      ]);

    // Act
    await playlistManagementService.reorderPlaylistOnSpotify("P1");

    // Assert
    expect(
      mockPlaylistOrderingService.definePlaylistTracksOrder
    ).toHaveBeenCalledWith(playlistTracks, playlistTracks[0]);
    expect(
      mockPlaylistMovementCalculator.getPlaylistReorderMovements
    ).toHaveBeenCalledWith(playlistTracks, reorderedItems);
    expect(mocks.reorderTracksInPlaylist).toHaveBeenCalledTimes(2);
    expect(mocks.reorderTracksInPlaylist).toHaveBeenNthCalledWith(
      1,
      "P1",
      2,
      1,
      { snapshot_id: "S1" }
    );
    expect(mocks.reorderTracksInPlaylist).toHaveBeenNthCalledWith(
      2,
      "P1",
      4,
      3,
      { snapshot_id: "S2" }
    );
  });

  // TODO implement this correctly
  it.todo(
    "Spotify Playlist Items Endpoint should be called 2 times for a playlist with 101 tracks"
  );

  it.todo(
    "An exception should be returned if there was a problem retrieving User´s Current Playback State from Spotify"
  );

  it.todo(
    "An exception should be returned if there was a problem retrieving Playlist Snapshot ID from Spotify"
  );
});

describe("Playlist management status change when the owner does not own a playlist", () => {
  beforeAll(() => {
    jest.spyOn(global, "setInterval");
  });

  it("Trying to manage a playlist that the user does not own should throw exception", async () => {
    // Arrange
    const userPlaylists = userPlaylistsFixture.generateUserPlaylistsItem([
      { userId: "U2", playlistId: "P1" },
    ]);
    const currentUserProfile =
      currentUserProfileFixture.generateCurrentUserProfile({ userId: "U1" });
    const mocks = {
      retrieveCurrentUserProfile: jest
        .fn()
        .mockResolvedValue(currentUserProfile),
      retrieveUserPlaylists: jest.fn().mockResolvedValue(userPlaylists),
    };
    setupSpotifyClientWrapperMock(mocks);

    // Act - Assert
    await expect(
      playlistManagementService.managePlaylist("P1")
    ).rejects.toThrow(ResourceDoesNotBelongToEntityError);
    expect(setInterval).toHaveBeenCalledTimes(0);
  });

  it("Trying to unmanage a playlist that the user does not own should throw exception and should not trigger a playlist reorder", async () => {
    // Arrange
    const userPlaylists = userPlaylistsFixture.generateUserPlaylistsItem([
      { userId: "U2", playlistId: "P1" },
    ]);
    const currentUserProfile =
      currentUserProfileFixture.generateCurrentUserProfile({ userId: "U1" });
    const mocks = {
      retrieveCurrentUserProfile: jest
        .fn()
        .mockResolvedValue(currentUserProfile),
      retrieveUserPlaylists: jest.fn().mockResolvedValue(userPlaylists),
    };
    setupSpotifyClientWrapperMock(mocks);

    // Act - Assert
    await expect(
      playlistManagementService.unmanagePlaylist("P1")
    ).rejects.toThrow(ResourceDoesNotBelongToEntityError);
    expect(setInterval).toHaveBeenCalledTimes(0);
  });

  it("Trying to manage a playlist that does not exist should throw exception and should not trigger a playlist reorder", async () => {
    // Arrange
    const userPlaylists = userPlaylistsFixture.generateUserPlaylistsItem([
      { userId: "U1", playlistId: "P1" },
    ]);
    const currentUserProfile =
      currentUserProfileFixture.generateCurrentUserProfile({ userId: "U1" });
    const mocks = {
      retrieveCurrentUserProfile: jest
        .fn()
        .mockResolvedValue(currentUserProfile),
      retrieveUserPlaylists: jest.fn().mockResolvedValue(userPlaylists),
    };
    setupSpotifyClientWrapperMock(mocks);

    // Act - Assert
    await expect(
      playlistManagementService.managePlaylist("NP1")
    ).rejects.toThrow(ResourceDoesNotBelongToEntityError);
    expect(setInterval).toHaveBeenCalledTimes(0);
  });

  it("Trying to unmanage a playlist that was not registred should throw exception", async () => {
    // Arrange
    jest.spyOn(mockManagedPlaylist, "get").mockReturnValue(false);
    jest.spyOn(global, "setInterval");
    // Act - Assert
    await expect(
      playlistManagementService.unmanagePlaylist("P1")
    ).rejects.toThrow(ResourceNotFoundError);
    expect(setInterval).toHaveBeenCalledTimes(0);
  });
});

describe("getManagedPlaylists method", () => {
  it("getManagedPlaylists should return all playlists that the user added to be ordered", async () => {
    // Arrange
    jest
      .spyOn(mockManagedPlaylist, "getAllPlaylistIds")
      .mockReturnValue(["P1", "P2", "P3"]);

    // Act
    const playlists = playlistManagementService.getManagedPlaylistsIds("RFT1");

    // Assert
    expect(playlists).toStrictEqual({ playlistIds: ["P1", "P2", "P3"] });
  });
});

describe("reorderPlaylist triggering conditions", () => {
  it("The function orderPlaylist should be called when no other orderPlaylist call is running for the same playlist", async () => {
    // Arrange
    // Learned the worst way: the async-lock library does not work with fake timers
    jest.useRealTimers();
    const REORDER_RUNNING_TIME = 50;
    const UNDER_REORDER_RUNNING_TIME = REORDER_RUNNING_TIME * 0.9;
    const REMAINING_RUNNING_TIME = REORDER_RUNNING_TIME * 0.1;

    playlistManagementService.reorderPlaylistOnSpotify = jest
      .fn()
      .mockImplementationOnce(() => sleep(REORDER_RUNNING_TIME));

    const isBusySpy = jest.spyOn(AsyncLock.prototype, "isBusy");

    // Act
    playlistManagementService.reorderPlaylist("P1", "RFT1");
    await sleep(UNDER_REORDER_RUNNING_TIME);
    playlistManagementService.reorderPlaylist("P1", "RFT1");
    await sleep(REMAINING_RUNNING_TIME);
    playlistManagementService.reorderPlaylist("P1", "RFT1");

    // Assert
    expect(isBusySpy).toHaveBeenCalledTimes(3);
    expect(isBusySpy).nthReturnedWith(1, false);
    expect(isBusySpy).nthReturnedWith(2, true);
    expect(isBusySpy).nthReturnedWith(3, false);
    expect(
      playlistManagementService.reorderPlaylistOnSpotify
    ).toHaveBeenCalledTimes(2);
  });
});

describe("reorderPlaylist triggering conditions", () => {
  beforeAll(() => {
    playlistManagementService.validatePlaylistBelongsToUser = jest.fn();
    playlistManagementService.validatePlaylistIsRegistred = jest.fn();
    mockManagedPlaylist.add = jest.fn();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  // TODO check that the timer object has been correctly deleted
  it("When the service is requested to unmanage the playlist, the timer for that playlist should cease running", async () => {
    // Arrange
    playlistManagementService.reorderPlaylistOnSpotify = jest.fn();
    jest.spyOn(mockManagedPlaylist, "get").mockReturnValue(expect.anything());

    // Act
    await playlistManagementService.unmanagePlaylist("P1");

    // Assert
    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(mockManagedPlaylist.get).toHaveBeenCalledTimes(1);
    expect(mockManagedPlaylist.remove).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(0);
  });

  it("The function reorderPlaylist should be called periodically after playlist is added to be managed", async () => {
    // Arrange
    globalVariables.ORDER_PLAYLIST_INTERVAL = 100;
    const TWO_INTERVALS_AND_A_HALF =
      2.5 * globalVariables.ORDER_PLAYLIST_INTERVAL;

    playlistManagementService.reorderPlaylist = jest.fn();

    // Act
    await playlistManagementService.managePlaylist("RFT1", "P1");
    jest.advanceTimersByTime(TWO_INTERVALS_AND_A_HALF);

    // Assert
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(playlistManagementService.reorderPlaylist).toHaveBeenCalledTimes(2);
    expect(playlistManagementService.reorderPlaylist).toHaveBeenNthCalledWith(
      1,
      "RFT1",
      "P1"
    );
    expect(playlistManagementService.reorderPlaylist).toHaveBeenNthCalledWith(
      2,
      "RFT1",
      "P1"
    );
    expect(mockManagedPlaylist.add).toHaveBeenCalledTimes(1);
  });
});
