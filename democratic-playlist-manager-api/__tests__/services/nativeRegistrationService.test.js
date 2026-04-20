/* eslint-env jest */
const nativeRegistrationService = require("../../src/services/nativeRegistrationService");
const nativeUsers = require("../../src/repositories/nativeUsers");
const ConflictError = require("../../src/errors/ConflictError");
const ValidationError = require("../../src/errors/ValidationError");

jest.mock("../../src/repositories/nativeUsers");

const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "Password1!";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AC.1: An unauthenticated user can register using native method", () => {
  it("Given a valid email and valid password, registration succeeds and returns the email", async () => {
    // Arrange
    nativeUsers.get.mockReturnValue(undefined);

    // Act
    const result = await nativeRegistrationService.register(
      VALID_EMAIL,
      VALID_PASSWORD
    );

    // Assert
    expect(nativeUsers.add).toHaveBeenCalledWith(
      VALID_EMAIL,
      expect.objectContaining({ email: VALID_EMAIL })
    );
    expect(result).toStrictEqual({ email: VALID_EMAIL });
  });

  it("Password stored is hashed, not plain text", async () => {
    // Arrange
    nativeUsers.get.mockReturnValue(undefined);

    // Act
    await nativeRegistrationService.register(VALID_EMAIL, VALID_PASSWORD);

    // Assert
    const storedUser = nativeUsers.add.mock.calls[0][1];
    expect(storedUser.password).not.toBe(VALID_PASSWORD);
  });
});

describe("AC.2: An unauthenticated user cannot register using an existing email", () => {
  it("Given an already registered email, registration throws ConflictError", async () => {
    // Arrange
    nativeUsers.get.mockReturnValue({ email: VALID_EMAIL, password: "hashed" });

    // Act
    const result = nativeRegistrationService.register(
      VALID_EMAIL,
      VALID_PASSWORD
    );

    // Assert
    await expect(result).rejects.toThrow(ConflictError);
    await expect(result).rejects.toThrow("Email already registered");
  });
});

describe("AC.3.1: An unauthenticated user cannot register with an invalid email format", () => {
  it.each([
    ["missing @", "invalidemail.com"],
    ["missing domain", "user@"],
    ["missing TLD", "user@domain"],
    ["empty string", ""],
  ])("%s", async (_, email) => {
    const result = nativeRegistrationService.register(email, VALID_PASSWORD);

    await expect(result).rejects.toThrow(ValidationError);
    await expect(result).rejects.toThrow("Invalid email format");
  });
});

describe("AC.3.2: An unauthenticated user cannot register with an invalid password format", () => {
  it.each([
    ["too short", "Ab1!"],
    ["no numbers", "Password!!"],
    ["no letters", "12345678!"],
    ["no special character", "Password1"],
  ])("%s", async (_, password) => {
    const result = nativeRegistrationService.register(VALID_EMAIL, password);

    await expect(result).rejects.toThrow(ValidationError);
    await expect(result).rejects.toThrow("Invalid password format");
  });
});
