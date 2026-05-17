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
  sessions.add.mockResolvedValue(undefined);
});

describe("AC.1: A natively registered user can login with email and password", () => {
  it("Given valid credentials, login succeeds and returns a token with userType invitee", async () => {
    const hashedPassword = await bcrypt.hash(VALID_PASSWORD, 10);
    nativeUsers.get.mockResolvedValue({ email: VALID_EMAIL, passwordHash: hashedPassword });

    const result = await nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD);

    expect(sessions.add).toHaveBeenCalledWith(result.token, expect.objectContaining({ userType: "invitee" }));
    expect(result.userType).toBe("invitee");
    expect(typeof result.token).toBe("string");
  });

  it("Given an unregistered email, login throws 401 GeneralError", async () => {
    nativeUsers.get.mockResolvedValue(undefined);

    await expect(nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD))
      .rejects.toThrow(GeneralError);
  });

  it("Given a wrong password, login throws 401 GeneralError", async () => {
    const hashedPassword = await bcrypt.hash("OtherPass1!", 10);
    nativeUsers.get.mockResolvedValue({ email: VALID_EMAIL, passwordHash: hashedPassword });

    await expect(nativeLoginService.login(VALID_EMAIL, VALID_PASSWORD))
      .rejects.toThrow(GeneralError);
  });
});
