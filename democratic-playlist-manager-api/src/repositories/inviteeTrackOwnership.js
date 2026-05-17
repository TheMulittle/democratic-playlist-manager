const prisma = require("../database/prismaClient");

async function add(playlistId, trackId, email) {
  const user = await prisma.user.findUnique({ where: { email } });
  const managedPlaylist = await prisma.managedPlaylist.findFirst({ where: { playlistId } });
  await prisma.managedSong.upsert({
    where: { managedPlaylistId_trackId: { managedPlaylistId: managedPlaylist.id, trackId } },
    update: { addedByUserId: user.id },
    create: { managedPlaylistId: managedPlaylist.id, trackId, addedByUserId: user.id },
  });
}

async function getOwner(playlistId, trackId) {
  const managedPlaylist = await prisma.managedPlaylist.findFirst({ where: { playlistId } });
  if (!managedPlaylist) return undefined;
  const song = await prisma.managedSong.findUnique({
    where: { managedPlaylistId_trackId: { managedPlaylistId: managedPlaylist.id, trackId } },
    include: { addedBy: true },
  });
  return song?.addedBy?.email;
}

module.exports = { add, getOwner };
