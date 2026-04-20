/* eslint-env jest */
const request = require("supertest");
const server = require("../src/server");
const voteSkip = require("../src/services/voteSkipService");

jest.mock("../src/services/currentUserProfileService");
const currentUserProfileService = require("../src/services/currentUserProfileService");

jest.mock("../src/services/playlistManagementService");
const playlistManagementService = require("../src/services/playlistManagementService");

jest.mock("../src/services/spotifyAuthenticationService.js");
const spotifyAuthenticationService = require("../src/services/spotifyAuthenticationService.js");

const ResourceDoesNotBelongToEntityError = require("../src/errors/ResourceDoesNotBelongToEntityError");
const ResourceNotFoundError = require("../src/errors/ResourceNotFoundError");
const readFixtureJson = require("../__fixtures__/utils/readFixtureJson");

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

describe("Device registration endpoints", () => {
  it("The fist time a device is registred should return 201", async () => {
    voteSkip.registerDevice = jest.fn(() => false);

    const res = await request(server)
      .get("/register")
      .set("deviceId", "XXXX")
      .send();

    expect(res.statusCode).toBe(201);
  });

  it("After the first registration, a device register return 200", async () => {
    voteSkip.registerDevice = jest.fn(() => true);

    const res = await request(server)
      .get("/register")
      .set("deviceId", "YYYY")
      .send();

    expect(res.statusCode).toBe(200);
  });
});

describe("Voteskip endpoints", () => {
  it("A registred device should get 200 when voteskiping", async () => {
    voteSkip.registerVote = jest.fn(() => true);

    const res = await request(server)
      .get("/voteskip")
      .set("deviceId", "YYYY1")
      .send();
    expect(res.statusCode).toBe(200);
  });

  it("An uregistred device should get 401 when voteskiping", async () => {
    voteSkip.registerVote = jest.fn(() => false);

    const res = await request(server)
      .get("/voteskip")
      .set("deviceId", "YYYY2")
      .send();

    expect(res.statusCode).toBe(401);
  });

  it.todo("An uregistred device should get 401 when voteskiping");
});

describe("Playlist ordering management endpoints", () => {
  beforeAll(() => {
    jest
      .spyOn(spotifyAuthenticationService, "isUserAuthenticated")
      .mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("When a client requests to add a playlist that they do not own, an status code 400 should be returned", async () => {
    playlistManagementService.managePlaylist = jest.fn(() => {
      throw new ResourceDoesNotBelongToEntityError("P1", "U1");
    });

    const res = await request(server)
      .post("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The given resource [P1] does not belong to the entity [U1]"
    );
  });

  it("When a client requests to add a playlist that they own for the first time, an status code 201 should be returned", async () => {
    playlistManagementService.managePlaylist = jest.fn(() => true);

    const res = await request(server)
      .post("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(201);
  });

  it.todo(
    "When a client requests to add a playlist that they own after the first time, an status code 200 should be returned"
  );

  it("When a client requests to remove a playlist that they own, an status code 200 should be returned", async () => {
    const res = await request(server)
      .delete("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Playlist Removed");
  });

  it("When a client requests to remove a playlist that they do not own, an status code 400 should be returned", async () => {
    playlistManagementService.unmanagePlaylist = jest.fn(() => {
      throw new ResourceDoesNotBelongToEntityError("P1", "U1");
    });

    const res = await request(server)
      .delete("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "The given resource [P1] does not belong to the entity [U1]"
    );
  });

  it("When a client requests to remove a playlist that they own, but that is not registred yet, an status code 404 should be returned", async () => {
    playlistManagementService.unmanagePlaylist = jest.fn(() => {
      throw new ResourceNotFoundError(
        "The given playlist [P1] was never added"
      );
    });

    const res = await request(server)
      .delete("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(
      "Resource not found: The given playlist [P1] was never added"
    );
  });

  it("When a client requests to remove a playlist that they own, but that is not registred yet, an status code 404 should be returned", async () => {
    playlistManagementService.unmanagePlaylist = jest.fn(() => {
      throw new ResourceNotFoundError(
        "The given playlist [P1] was never added"
      );
    });

    const res = await request(server)
      .delete("/playlist/P1")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(
      "Resource not found: The given playlist [P1] was never added"
    );
  });

  it("When a client requests the playlists that they have registred, status code 200 should be returned", async () => {
    const payload = { playlistIds: ["P1"] };
    playlistManagementService.getManagedPlaylistsIds = jest.fn(() => payload);

    const res = await request(server)
      .get("/playlist")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(payload);
  });

  it.todo(
    "When a client requests to remove a playlist that was never added, an status code 400 should be returned"
  );
});

describe("Trigger endpoints", () => {
  beforeAll(() => {
    jest
      .spyOn(spotifyAuthenticationService, "isUserAuthenticated")
      .mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("When a client requests to reorder all their playlists and they have no playlist being managed, status code 400 should be returned", async () => {
    // Arrange
    playlistManagementService.getManagedPlaylistsIds = jest.fn(() => ({
      playlistIds: [],
    }));

    // Act
    const res = await request(server)
      .post("/trigger-reorder")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    // Asssert
    expect(
      playlistManagementService.getManagedPlaylistsIds
    ).toHaveBeenCalledWith("RT1");
    expect(playlistManagementService.reorderPlaylist).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
  });

  it("When a client requests to reorder all their playlists and they have playlists being managed, status code 200 should be returned", async () => {
    // Arrange
    playlistManagementService.getManagedPlaylistsIds = jest.fn(() => ({
      playlistIds: ["I1", "I2"],
    }));

    // Act
    const res = await request(server)
      .post("/trigger-reorder")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    // Asssert
    expect(
      playlistManagementService.getManagedPlaylistsIds
    ).toHaveBeenCalledWith("RT1");
    expect(playlistManagementService.reorderPlaylist).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(200);
  });
});

describe("Spotify playlist endpoints", () => {
  beforeAll(() => {
    jest
      .spyOn(spotifyAuthenticationService, "isUserAuthenticated")
      .mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("When a client requests to retrieve all collaborative playlists pertaining to the user, status code 200 should be returned", async () => {
    const USER_PLAYLISTS = readFixtureJson("userPlaylistsGET.json");
    currentUserProfileService.getPlaylists = jest.fn(() => USER_PLAYLISTS);

    const res = await request(server)
      .get("/me/playlist/?collaborative=true&mine=true")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(currentUserProfileService.getPlaylists).toHaveBeenCalledWith(
      { collaborative: true, mine: true },
      "RT1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(USER_PLAYLISTS);
  });

  it("When a client requests to retrieve all user playlists, status code 200 should be returned", async () => {
    const USER_PLAYLISTS = readFixtureJson("userPlaylistsGET.json");
    currentUserProfileService.getPlaylists = jest.fn(() => USER_PLAYLISTS);

    const res = await request(server)
      .get("/me/playlist/")
      .set("Cookie", ["DP_RFT=RT1"])
      .send();

    expect(currentUserProfileService.getPlaylists).toHaveBeenCalledWith(
      {},
      "RT1"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(USER_PLAYLISTS);
  });
});

describe("Non authenticated users are not allowed to call protected endpoints", () => {
  beforeAll(() => {
    jest
      .spyOn(spotifyAuthenticationService, "isUserAuthenticated")
      .mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO: To be substitued with it.each whenever VS Code jest runner supports it
  it("When a client performs a post request to /playlist without being authenticated, an status code 401 should be returned", async () => {
    const res = await request(server).get("/playlist").send();

    expect(spotifyAuthenticationService.isUserAuthenticated).toBeCalledTimes(1);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(
      "The user is not authenticated. Please ensure to authenticate before performing this action"
    );
  });

  it("When a client performs a post request to /trigger-reorder without being authenticated, an status code 401 should be returned", async () => {
    const res = await request(server).post("/trigger-reorder").send();

    expect(spotifyAuthenticationService.isUserAuthenticated).toBeCalledTimes(1);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(
      "The user is not authenticated. Please ensure to authenticate before performing this action"
    );
  });


  it("When a client performs a delete request to /playlist without being authenticated, an status code 401 should be returned", async () => {
    const res = await request(server).delete("/playlist/P1").send();

    expect(spotifyAuthenticationService.isUserAuthenticated).toBeCalledTimes(1);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(
      "The user is not authenticated. Please ensure to authenticate before performing this action"
    );
  });
});

describe("Authentication", () => {
  it("When a client succesfully authenticates in spotify, a cookie should be returned", async () => {
    // Arrange
    const userLoginData = {
      refreshToken: "RFT1",
      accessToken: "ACT1",
      renovationTimestamp: expect.anything(),
    };
    jest
      .spyOn(spotifyAuthenticationService, "authenticate")
      .mockReturnValue(userLoginData);

    // Act
    const res = await request(server).get("/callback?code=123456").send();

    expect(spotifyAuthenticationService.authenticate).toHaveBeenCalledWith(
      "123456"
    );
    expect(res.statusCode).toBe(302);
    expect(res.header["set-cookie"][0]).toContain("DP_RFT=RFT1");
  });
});
