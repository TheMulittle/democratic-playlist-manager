const prisma = require("../database/prismaClient");
const PersistenceError = require("../errors/PersistenceError");

// Timers stay in-memory: { [sessionToken]: Map<playlistId, { timer }> }
const timers = {};

async function add(sessionToken, playlistId, item) {
  if (typeof sessionToken !== "string") {
    throw new PersistenceError(
      `Unable to persist a playlist timer with sessionToken different than a string. Instead it was [${typeof sessionToken}]`
    );
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });
  await prisma.managedPlaylist.upsert({
    where: { playlistId_hostId: { playlistId, hostId: session.userId } },
    update: {},
    create: { playlistId, hostId: session.userId },
  });

  if (!timers[sessionToken]) timers[sessionToken] = new Map();
  timers[sessionToken].set(playlistId, { ...item });
}

function get(sessionToken, playlistId) {
  return timers[sessionToken]?.get(playlistId) ?? undefined;
}

async function getAllPlaylistIds(sessionToken) {
  const session = await prisma.session.findUnique({ where: { token: sessionToken } });
  if (!session) return [];
  const playlists = await prisma.managedPlaylist.findMany({
    where: { hostId: session.userId },
  });
  return playlists.map((p) => p.playlistId);
}

function remove(sessionToken, playlistId) {
  timers[sessionToken]?.delete(playlistId);
}

async function getHostTokenByPlaylistId(playlistId) {
  const managedPlaylist = await prisma.managedPlaylist.findFirst({
    where: { playlistId },
    include: { host: { include: { sessions: true } } },
  });
  return managedPlaylist?.host?.sessions?.[0]?.token;
}

module.exports = { add, get, remove, getAllPlaylistIds, getHostTokenByPlaylistId };
