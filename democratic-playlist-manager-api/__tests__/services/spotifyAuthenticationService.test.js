/* eslint-env jest */
jest.mock("../../src/clients/SpotifyClientWrapper");
const SpotifyClientWrapper = require("../../src/clients/SpotifyClientWrapper");

jest.mock("../../src/repositories/authenticatedUsers");
const authenticatedUsers = require("../../src/repositories/authenticatedUsers");

const spotifyAuthenticationService = require("../../src/services/spotifyAuthenticationService");

describe("Authentication", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("authenticate should return authenticated user", async () => {
    // Arrange
    const NOW_TIMESTAMP = "2020-01-01T00:00:00.000Z";
    const RENOVATION_TIME_TIMESTAMP = "2020-01-01T00:50:00.000Z";

    const mockAuthenticate = jest.fn().mockImplementation(() => ({
      access_token: "ACT1",
      refresh_token: "RFT1",
      expires_in: 3600,
    }));
    SpotifyClientWrapper.mockImplementation(() => ({
      authenticate: mockAuthenticate,
    }));

    jest
      .spyOn(global.Date, "now")
      .mockReturnValue(new Date(NOW_TIMESTAMP).getTime());
    jest.spyOn(authenticatedUsers, "add");

    // Act
    const userLoginData = await spotifyAuthenticationService.authenticate("C1");

    // Assert
    const expectedUserLoginData = {
      refreshToken: "RFT1",
      accessToken: "ACT1",
      renovationTimestamp: RENOVATION_TIME_TIMESTAMP,
    };
    expect(userLoginData).toStrictEqual(expectedUserLoginData);
    expect(SpotifyClientWrapper).toHaveBeenCalledTimes(1);
    expect(mockAuthenticate).toHaveBeenCalledWith("C1");
    expect(authenticatedUsers.add).toHaveBeenCalledWith(
      "RFT1",
      expectedUserLoginData
    );
  });

  it("isUserAuthenticated should return true if user authenticated before", async () => {
    jest.spyOn(authenticatedUsers, "get").mockReturnValue({
      accessToken: "ACT1",
      refreshToken: "RFT1",
      renovationTimestamp: 3600,
    });

    // Act
    const isUserAuthenticated =
      spotifyAuthenticationService.isUserAuthenticated("U1");

    // Assert
    expect(isUserAuthenticated).toBe(true);
  });

  it("isUserAuthenticated should return false if user was not authenticated before", async () => {
    jest.spyOn(authenticatedUsers, "get").mockReturnValue(undefined);

    // Act
    const isUserAuthenticated =
      spotifyAuthenticationService.isUserAuthenticated("U1");

    // Assert
    expect(isUserAuthenticated).toBe(false);
  });
});

describe("Client provision", () => {
  const EXPIRATION_TIMESTAMP = "2020-01-01T00:50:00.000Z";
  const REFRESHED_EXPIRATION_TIMESTAMP = "2020-01-01T01:40:00.000Z";
  const JUST_BEFORE_TOKEN_RENOVATION_TIMESTAMP = "2020-01-01T00:49:59.000Z";
  const USER_AUTHENTICATION_INFO = {
    refreshToken: "RFT1",
    accessToken: "ACT1",
    renovationTimestamp: EXPIRATION_TIMESTAMP,
  };
  const USER_REFRESH_INFO = {
    refreshToken: "RFT1",
    clientId: undefined,
    clientSecret: undefined,
    redirectUri: undefined,
  };
  const REFRESHED_AUTHENTICATION_INFO = {
    refreshToken: "RFT1",
    accessToken: "ACT2",
    renovationTimestamp: REFRESHED_EXPIRATION_TIMESTAMP,
  };

  beforeEach(() => {
    authenticatedUsers.get.mockReturnValue(USER_AUTHENTICATION_INFO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("provideAuthenticatedClient should return a client with access token and refresh token when token is not about to expire", async () => {
    // Arrange
    jest
      .spyOn(global.Date, "now")
      .mockReturnValue(
        new Date(JUST_BEFORE_TOKEN_RENOVATION_TIMESTAMP).getTime()
      );

    // Act
    spotifyAuthenticationService.provideAuthenticatedClient("RFT1");

    // Assert
    expect(SpotifyClientWrapper).toHaveBeenCalledTimes(1);
    expect(SpotifyClientWrapper).toHaveBeenCalledWith(USER_AUTHENTICATION_INFO);
    expect(
      SpotifyClientWrapper.mock.instances[0].refreshToken
    ).toHaveBeenCalledTimes(0);
  });

  it("provideAuthenticatedClient should return a client with new access token and refresh token when the token is about to expire", async () => {
    // Arrange
    jest
      .spyOn(global.Date, "now")
      .mockReturnValue(new Date(EXPIRATION_TIMESTAMP).getTime());

    const mockRefreshToken = jest.fn().mockImplementation(() => ({
      access_token: "ACT2",
      expires_in: 3600,
    }));
    SpotifyClientWrapper.mockImplementation(() => ({
      refreshToken: mockRefreshToken,
    }));

    // Act
    await spotifyAuthenticationService.provideAuthenticatedClient("RFT1");

    // Assert
    expect(SpotifyClientWrapper).toHaveBeenCalledTimes(2);
    expect(SpotifyClientWrapper).toHaveBeenNthCalledWith(1, USER_REFRESH_INFO);
    expect(SpotifyClientWrapper).toHaveBeenNthCalledWith(
      2,
      REFRESHED_AUTHENTICATION_INFO
    );
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });
});
