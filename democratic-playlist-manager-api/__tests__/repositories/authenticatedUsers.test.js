/* eslint-env jest */
const PersistenceError = require("../../src/errors/PersistenceError");

const authenticatedUsers = require("../../src/repositories/authenticatedUsers");

it("Geting an user whose refresh token was added previously should return the user", async () => {
  // Arrange
  const expectedAuthenticationData = {
    accessToken: "AC1",
    refreshToken: "RFT1",
    renovationTimestamp: "2020-01-01T00:50:00.000Z",
  };
  authenticatedUsers.add("RFT1", expectedAuthenticationData);

  // Act
  const authenticationData = authenticatedUsers.get("RFT1");

  // Assert
  expect(authenticationData).toBe(expectedAuthenticationData);
});

it("Geting an user whose refresh token was not added previously should return a falsy value", async () => {
  // Act
  const authenticationData = authenticatedUsers.get("NRFT1");

  // Assert
  expect(authenticationData).toBeFalsy();
});

it("Geting an user whose refresh token is not a string should return a falsy value", async () => {
  // Act
  const authenticationData = authenticatedUsers.get(undefined);

  // Assert
  expect(authenticationData).toBeFalsy();
});

it("Adding an user whose refresh token is different than a string should throw PersistenceError error", async () => {
  // Arrange
  const expectedAuthenticationData = {
    accessToken: "AC1",
    refreshToken: "RFT1",
    renovationTimestamp: "2020-01-01T00:50:00.000Z",
  };

  // Act - Assert
  expect(() =>
    authenticatedUsers.add(undefined, expectedAuthenticationData)
  ).toThrow(PersistenceError);
  expect(() =>
    authenticatedUsers.add(undefined, expectedAuthenticationData)
  ).toThrow(
    "Unable to persist an user with refresh token different than a string. Instead it was [undefined]"
  );
});
