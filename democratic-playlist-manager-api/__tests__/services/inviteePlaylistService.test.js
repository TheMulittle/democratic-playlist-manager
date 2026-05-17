/* eslint-env jest */
const inviteePlaylistService = require("../../src/services/inviteePlaylistService");

jest.mock("../../src/repositories/sessions");
const sessions = require("../../src/repositories/sessions");

jest.mock("../../src/repositories/inviteeAssignments");
const inviteeAssignments = require("../../src/repositories/inviteeAssignments");

jest.mock("../../src/repositories/invitations");
const invitations = require("../../src/repositories/invitations");

jest.mock("../../src/repositories/managedPlaylists");
const managedPlaylists = require("../../src/repositories/managedPlaylists");

jest.mock("../../src/repositories/inviteeTrackOwnership");
const inviteeTrackOwnership = require("../../src/repositories/inviteeTrackOwnership");

jest.mock("../../src/clients/SpotifyClientWrapper");
const MockSpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

const ResourceNotFoundError = require("../../src/errors/ResourceNotFoundError");

const SESSION_TOKEN = "invitee-token";
const HOST_TOKEN = "host-token";
const PLAYLIST_ID = "playlist-123";
const INVITEE_EMAIL = "invitee@test.com";

function setupSpotifyMock(mocks) {
  MockSpotifyClientWrapper.mockImplementation(() => ({ ...mocks }));
}

beforeEach(() => {
  managedPlaylists.getHostTokenByPlaylistId.mockResolvedValue(HOST_TOKEN);
  sessions.get.mockImplementation(async (token) => {
    if (token === HOST_TOKEN) return { spotifyAccessToken: "host-access-token" };
    if (token === SESSION_TOKEN) return { email: INVITEE_EMAIL, spotifyId: "invitee-spotify-id" };
    return undefined;
  });
});

describe("inviteePlaylistService - getAssignedPlaylists", () => {
  it("returns playlists the invitee is assigned to", async () => {
    inviteeAssignments.getPlaylistIds.mockResolvedValue([PLAYLIST_ID]);
    invitations.getByPlaylistId.mockResolvedValue({ playlistId: PLAYLIST_ID, playlistName: "My Playlist" });

    const result = await inviteePlaylistService.getAssignedPlaylists(SESSION_TOKEN);

    expect(result.playlists).toEqual([{ playlistId: PLAYLIST_ID, playlistName: "My Playlist" }]);
  });

  it("returns empty list when invitee has no playlists", async () => {
    inviteeAssignments.getPlaylistIds.mockResolvedValue([]);

    const result = await inviteePlaylistService.getAssignedPlaylists(SESSION_TOKEN);

    expect(result.playlists).toEqual([]);
  });
});

describe("inviteePlaylistService - getPlaylistTracks", () => {
  it("throws ResourceNotFoundError when no host manages the playlist", async () => {
    managedPlaylists.getHostTokenByPlaylistId.mockResolvedValue(undefined);

    await expect(inviteePlaylistService.getPlaylistTracks(PLAYLIST_ID, SESSION_TOKEN))
      .rejects.toThrow(ResourceNotFoundError);
  });

  it("marks track as own when invitee added it via the system", async () => {
    inviteeTrackOwnership.getOwner.mockResolvedValue(INVITEE_EMAIL);
    setupSpotifyMock({
      retrieveCurrentTrackId: jest.fn().mockResolvedValue("T1"),
      retrievePlaylistTracksWithDetails: jest.fn().mockResolvedValue([
        { track: { id: "T1", name: "Song", artists: [{ name: "Artist" }] }, added_by: { id: "host-spotify-id" } },
      ]),
    });

    const result = await inviteePlaylistService.getPlaylistTracks(PLAYLIST_ID, SESSION_TOKEN);

    expect(result.tracks[0].isOwn).toBe(true);
    expect(result.tracks[0].isCurrent).toBe(true);
    expect(result.tracks[0].addedBy).toBe(INVITEE_EMAIL);
  });

  it("marks track as not own when added by someone else", async () => {
    inviteeTrackOwnership.getOwner.mockResolvedValue(undefined);
    setupSpotifyMock({
      retrieveCurrentTrackId: jest.fn().mockResolvedValue(""),
      retrievePlaylistTracksWithDetails: jest.fn().mockResolvedValue([
        { track: { id: "T1", name: "Song", artists: [{ name: "Artist" }] }, added_by: { id: "other-spotify-id" } },
      ]),
    });

    const result = await inviteePlaylistService.getPlaylistTracks(PLAYLIST_ID, SESSION_TOKEN);

    expect(result.tracks[0].isOwn).toBe(false);
    expect(result.tracks[0].addedBy).toBe("other-spotify-id");
  });
});

describe("inviteePlaylistService - searchTracks", () => {
  it("returns search results from Spotify", async () => {
    setupSpotifyMock({
      searchTracks: jest.fn().mockResolvedValue([
        { id: "T1", uri: "spotify:track:T1", name: "Song", artists: [{ name: "Artist" }] },
      ]),
    });

    const result = await inviteePlaylistService.searchTracks(PLAYLIST_ID, "Song");

    expect(result.tracks).toEqual([{ id: "T1", uri: "spotify:track:T1", name: "Song", artists: "Artist" }]);
  });

  it("throws ResourceNotFoundError when no host manages the playlist", async () => {
    managedPlaylists.getHostTokenByPlaylistId.mockResolvedValue(undefined);

    await expect(inviteePlaylistService.searchTracks(PLAYLIST_ID, "Song"))
      .rejects.toThrow(ResourceNotFoundError);
  });
});

describe("inviteePlaylistService - addTrack", () => {
  it("adds the track via host token and records invitee ownership", async () => {
    inviteeTrackOwnership.add.mockResolvedValue(undefined);
    setupSpotifyMock({
      addTrackToPlaylist: jest.fn().mockResolvedValue({}),
    });

    await inviteePlaylistService.addTrack(PLAYLIST_ID, "spotify:track:T1", SESSION_TOKEN);

    expect(inviteeTrackOwnership.add).toHaveBeenCalledWith(PLAYLIST_ID, "T1", INVITEE_EMAIL);
  });

  it("throws ResourceNotFoundError when no host manages the playlist", async () => {
    managedPlaylists.getHostTokenByPlaylistId.mockResolvedValue(undefined);

    await expect(inviteePlaylistService.addTrack(PLAYLIST_ID, "spotify:track:T1", SESSION_TOKEN))
      .rejects.toThrow(ResourceNotFoundError);
  });
});
