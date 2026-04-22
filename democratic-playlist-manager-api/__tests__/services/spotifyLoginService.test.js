/* eslint-env jest */
const spotifyLoginService = require("../../src/services/spotifyLoginService");
const thirdPartyUsers = require("../../src/repositories/thirdPartyUsers");
const sessions = require("../../src/repositories/sessions");
const GeneralError = require("../../src/errors/GeneralError");

jest.mock("../../src/repositories/thirdPartyUsers");
jest.mock("../../src/repositories/sessions");
jest.mock("../../src/clients/SpotifyClientWrapper");
const MockSpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

const MOCK_PROFILE = { id: "spotify-user-123", email: "user@spotify.com" };
const MOCK_ACCESS_DATA = { access_token: "access-token", expires_in: 3600 };
const MOCK_USER = { spotifyId: MOCK_PROFILE.id, email: MOCK_PROFILE.email, providerKey: "spotify:spotify-user-123" };

beforeEach(() => {
  jest.clearAllMocks();
  MockSpotifyClientWrapper.mockImplementation(() => ({
    authenticate: jest.fn().mockResolvedValue(MOCK_ACCESS_DATA),
    createAuthorizeURL: jest.fn().mockReturnValue("https://spotify.com/authorize"),
    retrieveCurrentUserProfile: jest.fn().mockResolvedValue(MOCK_PROFILE),
  }));
});

describe("AC.2: A third party registered user can login with Spotify", () => {
  it("Given a successful Spotify auth and registered user, login returns a token with userType host", async () => {
    // Arrange
    thirdPartyUsers.get.mockReturnValue(MOCK_USER);

    // Act
    const result = await spotifyLoginService.loginViaSpotify("auth-code");

    // Assert
    expect(sessions.add).toHaveBeenCalledWith(result.token, expect.objectContaining({ userType: "host" }));
    expect(result.userType).toBe("host");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  it("Given a successful Spotify auth but unregistered user, login throws 401 GeneralError", async () => {
    // Arrange
    thirdPartyUsers.get.mockReturnValue(undefined);

    // Act
    const result = spotifyLoginService.loginViaSpotify("auth-code");

    // Assert
    await expect(result).rejects.toThrow(GeneralError);
    await expect(result).rejects.toThrow("No account found for this Spotify user");
  });

  it("Given a failed Spotify auth response, login throws 401 GeneralError", async () => {
    // Arrange
    MockSpotifyClientWrapper.mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(null),
      retrieveCurrentUserProfile: jest.fn(),
    }));

    // Act
    const result = spotifyLoginService.loginViaSpotify("bad-code");

    // Assert
    await expect(result).rejects.toThrow(GeneralError);
    await expect(result).rejects.toThrow("Spotify authentication failed");
  });
});

describe("AC.4: A user can be logged in from multiple devices simultaneously", () => {
  it("Logging in twice creates two independent session tokens", async () => {
    // Arrange
    thirdPartyUsers.get.mockReturnValue(MOCK_USER);

    // Act
    const result1 = await spotifyLoginService.loginViaSpotify("code-1");
    const result2 = await spotifyLoginService.loginViaSpotify("code-2");

    // Assert
    expect(result1.token).not.toBe(result2.token);
    expect(sessions.add).toHaveBeenCalledTimes(2);
  });
});
