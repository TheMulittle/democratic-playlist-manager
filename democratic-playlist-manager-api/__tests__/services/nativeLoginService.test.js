/* eslint-env jest */
const nativeLoginService = require("../../src/services/nativeLoginService");
const nativeUsers = require("../../src/repositories/nativeUsers");
const sessions = require("../../src/repositories/sessions");
const GeneralError = require("../../src/errors/GeneralError");
const bcrypt = require("bcrypt");

jest.mock("../../src/repositories/nativeUsers");
jest.mock("../../src/repositories/sessions");

const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "Password1!";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AC.1: A natively registered user can login with email and password", () => {
  it("Given valid credentials, login succeeds and returns a token with userType invitee", async () => {
    // Arrange
    const hashedPassword = await bcrypt.hash(VALID_PASSWORD, 10);
    nativeUsers.get.mockReturnValue({ email: VALID_EMAIL, password: hashedPassword });

    // Act
    const result = await nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD);

    // Assert
    expect(sessions.add).toHaveBeenCalledWith(result.token, expect.objectContaining({ userType: "invitee" }));
    expect(result.userType).toBe("invitee");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  it("Given an unregistered email, login throws 401 GeneralError", async () => {
    // Arrange
    nativeUsers.get.mockReturnValue(undefined);

    // Act
    const result = nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD);

    // Assert
    await expect(result).rejects.toThrow(GeneralError);
    await expect(result).rejects.toThrow("Invalid email or password");
  });

  it("Given a wrong password, login throws 401 GeneralError", async () => {
    // Arrange
    const hashedPassword = await bcrypt.hash("OtherPass1!", 10);
    nativeUsers.get.mockReturnValue({ email: VALID_EMAIL, password: hashedPassword });

    // Act
    const result = nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD);

    // Assert
    await expect(result).rejects.toThrow(GeneralError);
    await expect(result).rejects.toThrow("Invalid email or password");
  });
});
