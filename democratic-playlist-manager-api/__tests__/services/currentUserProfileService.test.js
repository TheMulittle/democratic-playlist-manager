/* eslint-env jest */
const userPlaylistsFixture = require("../../__fixtures__/userPlaylists.fixture");
const currentUserProfileFixture = require("../../__fixtures__/currentUserProfile.fixture");

jest.mock("../../src/clients/SpotifyClientWrapper");
const MockSpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

const mockProvideAuthentication = jest
  .fn()
  .mockImplementation(() => new MockSpotifyClientWrapper());
const mockSpotifyAuthenticationService = require("../../src/services/spotifyAuthenticationService.js");

mockSpotifyAuthenticationService.provideAuthenticatedClient =
  mockProvideAuthentication;

const currentUserProfileService = require("../../src/services/currentUserProfileService");

function setupSpotifyClientWrapperMock(mocks) {
  MockSpotifyClientWrapper.mockImplementation(() => {
    return { ...mocks };
  });
}

describe('getPlaylists should return the playlists filtered by the content of "options" parameter', () => {
  const USER_PLAYLISTS = userPlaylistsFixture.generateUserPlaylistsItem([
    {
      userId: "U1",
      playlistId: "P1",
      playlistName: "N1",
      public: false,
      collaborative: false,
    },
    {
      userId: "U1",
      playlistId: "P2",
      playlistName: "N2",
      public: false,
      collaborative: true,
    },
    {
      userId: "U1",
      playlistId: "P3",
      playlistName: "N3",
      public: true,
      collaborative: false,
    },
    {
      userId: "U1",
      playlistId: "P4",
      playlistName: "N4",
      public: true,
      collaborative: true,
    },
    {
      userId: "U2",
      playlistId: "P5",
      playlistName: "N5",
      public: false,
      collaborative: true,
    },
    {
      userId: "U2",
      playlistId: "P6",
      playlistName: "N6",
      public: true,
      collaborative: false,
    },
    {
      userId: "U2",
      playlistId: "P7",
      playlistName: "N7",
      public: true,
      collaborative: true,
    },
  ]);

  beforeAll(() => {
    const currentUserProfile =
      currentUserProfileFixture.generateCurrentUserProfile({ userId: "U1" });
    const mocks = {
      retrieveUserPlaylists: jest.fn().mockResolvedValue(USER_PLAYLISTS),
      retrieveCurrentUserProfile: jest
        .fn()
        .mockResolvedValue(currentUserProfile),
    };
    setupSpotifyClientWrapperMock(mocks);
  });

  it("When the option obejct is empty, should return all playlists from user", async () => {
    // Arrange
    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      {},
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({ playlists: USER_PLAYLISTS });
  });

  it('When the option object has property "mine" equals true, should return only the playlists from that user', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { mine: true },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({
      playlists: USER_PLAYLISTS.slice(0, 4),
    });
  });

  it('When the option object has property "mine" equals false, returns only playlists that are not from that user', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { mine: false },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({
      playlists: USER_PLAYLISTS.slice(4, 7),
    });
  });

  it('When the option object has property "mine" equals a non-boolean, should return playlists owned by user and followed by the user', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { mine: "random" },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({ playlists: USER_PLAYLISTS });
  });

  it('When the option object has property "collaborative" equals true, should return only the playlists that are collaborative', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { collaborative: true },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({
      playlists: [
        USER_PLAYLISTS[1],
        USER_PLAYLISTS[3],
        USER_PLAYLISTS[4],
        USER_PLAYLISTS[6],
      ],
    });
  });

  it('When the option object has property "collaborative" equals false, should return only the playlists that are not collaborative', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { collaborative: false },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({
      playlists: [USER_PLAYLISTS[0], USER_PLAYLISTS[2], USER_PLAYLISTS[5]],
    });
  });

  it('When the option object has property "collaborative" equals a non-boolean, should return collaborative and non-collaborative playlists', async () => {
    // Arrange

    // Act
    const actualPlaylist = await currentUserProfileService.getPlaylists(
      { collaborative: "random" },
      "RFT1"
    );

    // Assert
    expect(actualPlaylist).toStrictEqual({ playlists: USER_PLAYLISTS });
  });

  it.todo("handling pagination");
});
