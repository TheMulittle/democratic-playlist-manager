/* eslint-env jest */
const spotifyRegistrationService = require("../../src/services/spotifyRegistrationService");
const thirdPartyUsers = require("../../src/repositories/thirdPartyUsers");
const sessions = require("../../src/repositories/sessions");
const ConflictError = require("../../src/errors/ConflictError");

jest.mock("../../src/repositories/thirdPartyUsers");
jest.mock("../../src/repositories/sessions");
jest.mock("../../src/clients/SpotifyClientWrapper");
const MockSpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

const MOCK_PROFILE = { id: "spotify-user-123", email: "user@spotify.com" };
const MOCK_ACCESS_DATA = { access_token: "access-token", refresh_token: "refresh-token", expires_in: 3600 };

function setupSpotifyMock() {
  MockSpotifyClientWrapper.mockImplementation(() => ({
    authenticate: jest.fn().mockResolvedValue(MOCK_ACCESS_DATA),
    createAuthorizeURL: jest.fn().mockReturnValue("https://spotify.com/authorize"),
    retrieveCurrentUserProfile: jest.fn().mockResolvedValue(MOCK_PROFILE),
  }));
}

beforeEach(() => {
  jest.clearAllMocks();
  setupSpotifyMock();
});

describe("AC.1: An unauthenticated user can register using a third party service", () => {
  it("Given a successful Spotify auth and unregistered user, a session token is created and user is stored", async () => {
    // Arrange
    thirdPartyUsers.get.mockReturnValue(undefined);

    // Act
    const sessionToken = await spotifyRegistrationService.registerViaSpotify("auth-code");

    // Assert
    expect(thirdPartyUsers.add).toHaveBeenCalledWith(
      "spotify:spotify-user-123",
      expect.objectContaining({ spotifyId: MOCK_PROFILE.id, email: MOCK_PROFILE.email })
    );
    expect(sessions.add).toHaveBeenCalledWith(sessionToken, expect.objectContaining({ spotifyId: MOCK_PROFILE.id }));
    expect(typeof sessionToken).toBe("string");
    expect(sessionToken.length).toBeGreaterThan(0);
  });
});

describe("AC.2: An unauthenticated user that fails to authenticate to Spotify won't be registered", () => {
  it("Given a failed Spotify auth response, registration throws an error", async () => {
    // Arrange
    MockSpotifyClientWrapper.mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(null),
      retrieveCurrentUserProfile: jest.fn(),
    }));

    // Act
    const result = spotifyRegistrationService.registerViaSpotify("bad-code");

    // Assert
    await expect(result).rejects.toThrow("Spotify authentication failed");
    expect(thirdPartyUsers.add).not.toHaveBeenCalled();
    expect(sessions.add).not.toHaveBeenCalled();
  });
});

describe("AC.3: An unauthenticated user already registered with Spotify won't be registered again", () => {
  it("Given an already registered Spotify user, registration throws ConflictError", async () => {
    // Arrange
    thirdPartyUsers.get.mockReturnValue({ spotifyId: MOCK_PROFILE.id, email: MOCK_PROFILE.email });

    // Act
    const result = spotifyRegistrationService.registerViaSpotify("auth-code");

    // Assert
    await expect(result).rejects.toThrow(ConflictError);
    await expect(result).rejects.toThrow("User already registered with this Spotify account");
    expect(sessions.add).not.toHaveBeenCalled();
  });
});
