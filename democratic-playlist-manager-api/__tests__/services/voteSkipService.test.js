/* eslint-env jest */
const voteSkip = require("../../src/services/voteSkipService");

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

describe("Register device tests", () => {
  it("The fist time a device is registred a timer should be created for removing it", async () => {
    const spy = jest.spyOn(voteSkip, "createRefresherTimeOut");
    voteSkip.registerDevice("XXXX1");
    expect(spy).toBeCalledWith("XXXX1");
  });

  it("After the first time a device is registred, timer should not be created ", async () => {
    const spy = jest.spyOn(voteSkip, "createRefresherTimeOut");
    // We use the modern timer mocking because it returns an object similar to the Timer object. The legacy one returns a weird structure
    jest.useFakeTimers("modern");

    voteSkip.registerDevice("XXXX2");
    voteSkip.registerDevice("XXXX2");
    voteSkip.registerDevice("XXXX2");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("After a long period without being registred, the device should be removed", async () => {
    voteSkip.registerDevice("XXXX3");
    jest.runAllTimers();
    voteSkip.registerDevice("XXXX3");
    expect(setTimeout).toHaveBeenCalledTimes(2);
  });
});

describe("Vote skip tests", () => {
  it("A registred device should be able to vote kick", async () => {
    voteSkip.registerDevice("XXXX4");
    expect(voteSkip.registerVote("XXXX4")).toBe(true);
  });

  it("An unregistred device should not be able to vote kick ", async () => {
    expect(voteSkip.registerVote("XXXX5")).toBe(false);
  });

  it("A registred device should not be able to vote kick twice", async () => {
    voteSkip.registerDevice("XXXX51");
    voteSkip.registerVote("XXXX51");

    expect(voteSkip.registerVote("XXXX51")).toBe(false);
  });

  it.todo(
    "//TODO not huge importance - The vote kick from a device that just became unregistred should be withdrawn"
  );

  it("Should return true when half the registred devices are not pending voting", async () => {
    voteSkip.registerDevice("XXXX61");
    voteSkip.registerDevice("XXXX62");
    voteSkip.registerDevice("XXXX63");
    voteSkip.registerDevice("XXXX64");
    voteSkip.registerVote("XXXX61");
    voteSkip.registerVote("XXXX62");
    voteSkip.registerVote("XXXX63");

    expect(voteSkip.didSkipWin()).toBe(true);
  });

  it.todo(
    "Current song should be skipped when more than half registred devices vote for skip"
  );
});
