const deviceTracking = new Map([]);

function registerDevice(deviceId) {
  if (deviceTracking.get(deviceId) !== undefined) {
    deviceTracking.get(deviceId).deviceRefreshTimeout.refresh();
    return true;
  }

  const deviceRefreshTimeout = module.exports.createRefresherTimeOut(deviceId);
  const deviceInfo = { deviceRefreshTimeout, pendingVote: true };
  deviceTracking.set(deviceId, deviceInfo);
  return false;
}

function createRefresherTimeOut(deviceId) {
  return setTimeout(() => {
    deviceTracking.delete(deviceId);
  }, 60000);
}

function registerVote(deviceId) {
  if (
    deviceTracking.has(deviceId) &&
    deviceTracking.get(deviceId).pendingVote
  ) {
    deviceTracking.get(deviceId).pendingVote = false;
    return true;
  }

  return false;
}

function didSkipWin() {
  if (deviceTracking.size > 0) {
    const voteStatuses = [...deviceTracking.values()].map(
      (device) => device.pendingVote
    );
    const numberOfSkipVotes = voteStatuses.filter((status) => !status).length;
    return numberOfSkipVotes / deviceTracking.size > 0.5;
  }

  return false;
}

module.exports.registerDevice = registerDevice;
module.exports.createRefresherTimeOut = createRefresherTimeOut;
module.exports.registerVote = registerVote;
module.exports.didSkipWin = didSkipWin;
