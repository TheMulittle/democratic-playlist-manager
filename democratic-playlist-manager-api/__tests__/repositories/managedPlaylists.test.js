/* eslint-env jest */
const PersistenceError = require("../../src/errors/PersistenceError");

const managedPlaylists = require("../../src/repositories/managedPlaylists");

const DUMMY_TIMER = {
  timer: expect.anything(),
  orderingRunning: expect.anything(),
};

it("Geting a playlist timer whose refresh token was added previously should return the timer", async () => {
  // Arrange
  managedPlaylists.add("RFT1", "P1", DUMMY_TIMER);

  // Act
  const authenticationData = managedPlaylists.get("RFT1", "P1");

  // Assert
  expect(authenticationData).toStrictEqual(expect.anything());
});

it("Geting a playlist timer whose playlistId was not added previously should return a falsy value", async () => {
  // Act
  const authenticationData = managedPlaylists.get("RFT1", "NP1");

  // Assert
  expect(authenticationData).toBeFalsy();
});

it("Geting a playlist timer whose playlistId is not a string should return a falsy value", async () => {
  // Act
  const authenticationData = managedPlaylists.get("RFT1", undefined);

  // Assert
  expect(authenticationData).toBeFalsy();
});

it("Geting a playlist timer whose refreshToken is not a string should return a falsy value", async () => {
  // Act
  const authenticationData = managedPlaylists.get(undefined, "P1");

  // Assert
  expect(authenticationData).toBeFalsy();
});

it("Adding a playlist whose playlistId is different than a string should throw PersistenceError error", async () => {
  // Act - Assert
  expect(() =>
    managedPlaylists.add(undefined, expect.anything(), expect.anything())
  ).toThrow(PersistenceError);
  expect(() =>
    managedPlaylists.add(undefined, expect.anything(), expect.anything())
  ).toThrow(
    "Unable to persist a playlist timer with refreshToken different than a string. Instead it was [undefined]"
  );
});

it("Geting playlist timer that was removed should return undefined", async () => {
  // Arrange
  managedPlaylists.add("RFT1", "P2", expect.anything());

  // Act
  managedPlaylists.remove("RFT1", "P2");
  const playlistTimer = managedPlaylists.get("RFT1", "P2");

  // Assert
  expect(playlistTimer).toBeFalsy();
});

it("Geting all playlist ids for refresh token should return an array of playlistIds", async () => {
  // Arrange
  managedPlaylists.add("RFT3", "P1", DUMMY_TIMER);
  managedPlaylists.add("RFT3", "P2", DUMMY_TIMER);
  managedPlaylists.add("RFT3", "P3", DUMMY_TIMER);

  // Act
  const playlistIds = managedPlaylists.getAllPlaylistIds("RFT3");

  // Assert
  expect(playlistIds).toStrictEqual(["P1", "P2", "P3"]);
});

it("Geting all playlist ids for refresh token that does not have any playlist should return an array of playlistIds", async () => {
  // Arrange

  // Act
  const playlistIds = managedPlaylists.getAllPlaylistIds("RFT4");

  // Assert
  expect(playlistIds).toStrictEqual([]);
});
