/* eslint-env jest */
const invitationService = require("../../src/services/invitationService");

jest.mock("../../src/repositories/invitations");
const invitations = require("../../src/repositories/invitations");

jest.mock("../../src/repositories/managedPlaylists");
const managedPlaylists = require("../../src/repositories/managedPlaylists");

jest.mock("../../src/repositories/sessions");
const sessions = require("../../src/repositories/sessions");

jest.mock("../../src/repositories/inviteeAssignments");
const inviteeAssignments = require("../../src/repositories/inviteeAssignments");

const ResourceDoesNotBelongToEntityError = require("../../src/errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../../src/errors/ResourceNotFoundError");

const SESSION_TOKEN = "session-token";
const PLAYLIST_ID = "playlist-123";
const PLAYLIST_NAME = "My Playlist";

describe("invitationService - createInvitation", () => {
  it("creates an invitation when the playlist is managed by the host", () => {
    managedPlaylists.getAllPlaylistIds.mockReturnValue([PLAYLIST_ID]);

    const result = invitationService.createInvitation(PLAYLIST_ID, PLAYLIST_NAME, SESSION_TOKEN);

    expect(invitations.add).toHaveBeenCalledWith(expect.any(String), PLAYLIST_ID, PLAYLIST_NAME);
    expect(result.inviteToken).toBeDefined();
    expect(result.playlistId).toBe(PLAYLIST_ID);
  });

  it("throws ResourceDoesNotBelongToEntityError when playlist is not managed by the host", () => {
    managedPlaylists.getAllPlaylistIds.mockReturnValue([]);

    expect(() =>
      invitationService.createInvitation(PLAYLIST_ID, PLAYLIST_NAME, SESSION_TOKEN)
    ).toThrow(ResourceDoesNotBelongToEntityError);
  });
});

describe("invitationService - getInvitation", () => {
  it("returns the invitation when inviteToken and playlistId match", () => {
    invitations.get.mockReturnValue({ playlistId: PLAYLIST_ID, playlistName: PLAYLIST_NAME });

    const result = invitationService.getInvitation("token-abc", PLAYLIST_ID);

    expect(result).toEqual({ playlistId: PLAYLIST_ID, playlistName: PLAYLIST_NAME });
  });

  it("throws ResourceNotFoundError when inviteToken does not exist", () => {
    invitations.get.mockReturnValue(undefined);

    expect(() => invitationService.getInvitation("bad-token", PLAYLIST_ID)).toThrow(ResourceNotFoundError);
  });

  it("throws ResourceNotFoundError when playlistId does not match", () => {
    invitations.get.mockReturnValue({ playlistId: "other-playlist", playlistName: PLAYLIST_NAME });

    expect(() => invitationService.getInvitation("token-abc", PLAYLIST_ID)).toThrow(ResourceNotFoundError);
  });
});

describe("invitationService - acceptInvitation", () => {
  it("records the invitee assignment when the invitation is valid", () => {
    invitations.get.mockReturnValue({ playlistId: PLAYLIST_ID, playlistName: PLAYLIST_NAME });
    sessions.get.mockReturnValue({ email: "invitee@test.com" });

    invitationService.acceptInvitation("token-abc", PLAYLIST_ID, SESSION_TOKEN);

    expect(inviteeAssignments.add).toHaveBeenCalledWith("invitee@test.com", PLAYLIST_ID);
  });

  it("throws ResourceNotFoundError when the invitation is invalid", () => {
    invitations.get.mockReturnValue(undefined);

    expect(() =>
      invitationService.acceptInvitation("bad-token", PLAYLIST_ID, SESSION_TOKEN)
    ).toThrow(ResourceNotFoundError);
  });
});
