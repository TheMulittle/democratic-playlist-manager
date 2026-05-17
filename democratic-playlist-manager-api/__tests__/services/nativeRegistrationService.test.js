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
    nativeUsers.get.mockResolvedValue(undefined);
    nativeUsers.add.mockResolvedValue(undefined);

    const result = await nativeRegistrationService.register(VALID_EMAIL, VALID_PASSWORD);

    expect(nativeUsers.add).toHaveBeenCalledWith(
      VALID_EMAIL,
      expect.objectContaining({ passwordHash: expect.any(String) })
    );
    expect(result).toStrictEqual({ email: VALID_EMAIL });
  });

  it("Password stored is hashed, not plain text", async () => {
    nativeUsers.get.mockResolvedValue(undefined);
    nativeUsers.add.mockResolvedValue(undefined);

    await nativeRegistrationService.register(VALID_EMAIL, VALID_PASSWORD);

    const storedUser = nativeUsers.add.mock.calls[0][1];
    expect(storedUser.passwordHash).not.toBe(VALID_PASSWORD);
  });
});

describe("AC.2: An unauthenticated user cannot register using an existing email", () => {
  it("Given an already registered email, registration throws ConflictError", async () => {
    nativeUsers.get.mockResolvedValue({ email: VALID_EMAIL, passwordHash: "hashed" });

    await expect(nativeRegistrationService.register(VALID_EMAIL, VALID_PASSWORD))
      .rejects.toThrow(ConflictError);
  });
});

describe("AC.3.1: An unauthenticated user cannot register with an invalid email format", () => {
  it.each([
    ["missing @", "invalidemail.com"],
    ["missing domain", "user@"],
    ["missing TLD", "user@domain"],
    ["empty string", ""],
  ])("%s", async (_, email) => {
    await expect(nativeRegistrationService.register(email, VALID_PASSWORD))
      .rejects.toThrow(ValidationError);
  });
});

describe("AC.3.2: An unauthenticated user cannot register with an invalid password format", () => {
  it.each([
    ["too short", "Ab1!"],
    ["no numbers", "Password!!"],
    ["no letters", "12345678!"],
    ["no special character", "Password1"],
  ])("%s", async (_, password) => {
    await expect(nativeRegistrationService.register(VALID_EMAIL, password))
      .rejects.toThrow(ValidationError);
  });
});
