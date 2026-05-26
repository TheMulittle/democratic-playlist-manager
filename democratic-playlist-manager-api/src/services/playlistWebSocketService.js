const sessions = require("../repositories/sessions");
const inviteePlaylistService = require("../services/inviteePlaylistService");

const POLL_INTERVAL = 5000;
const playlistSubscribers = new Map(); // playlistId -> Set<{ ws, token }>
const playlistPollers = new Map(); // playlistId -> intervalId
const lastSnapshots = new Map(); // playlistId -> JSON string

async function authenticate(token) {
  const session = await sessions.get(token);
  return session ? session : null;
}

function subscribe(ws, playlistId, token) {
  if (!playlistSubscribers.has(playlistId)) {
    playlistSubscribers.set(playlistId, new Set());
  }
  const sub = { ws, token };
  playlistSubscribers.get(playlistId).add(sub);

  if (!playlistPollers.has(playlistId)) {
    startPolling(playlistId);
  }

  ws.on("close", () => unsubscribe(sub, playlistId));
}

function unsubscribe(sub, playlistId) {
  const subs = playlistSubscribers.get(playlistId);
  if (subs) {
    subs.delete(sub);
    if (subs.size === 0) {
      stopPolling(playlistId);
      playlistSubscribers.delete(playlistId);
      lastSnapshots.delete(playlistId);
    }
  }
}

function startPolling(playlistId) {
  const intervalId = setInterval(() => pollPlaylist(playlistId), POLL_INTERVAL);
  playlistPollers.set(playlistId, intervalId);
}

function stopPolling(playlistId) {
  const intervalId = playlistPollers.get(playlistId);
  if (intervalId) {
    clearInterval(intervalId);
    playlistPollers.delete(playlistId);
  }
}

async function pollPlaylist(playlistId) {
  const subs = playlistSubscribers.get(playlistId);
  if (!subs || subs.size === 0) return;

  const firstSub = [...subs][0];
  try {
    const { tracks } = await inviteePlaylistService.getPlaylistTracks(playlistId, firstSub.token);
    const snapshot = JSON.stringify(tracks);

    if (snapshot !== lastSnapshots.get(playlistId)) {
      lastSnapshots.set(playlistId, snapshot);
      const message = JSON.stringify({ type: "tracks_updated", tracks });
      for (const sub of subs) {
        if (sub.ws.readyState === 1) {
          sub.ws.send(message);
        }
      }
    }
  } catch (err) {
    // Silently skip poll errors (e.g. expired token)
  }
}

module.exports = { authenticate, subscribe };
