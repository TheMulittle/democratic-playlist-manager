const prisma = require("../database/prismaClient");

async function add(email, playlistId) {
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.inviteePlaylistAssignment.upsert({
    where: { inviteeId_playlistId: { inviteeId: user.id, playlistId } },
    update: {},
    create: { inviteeId: user.id, playlistId },
  });
}

async function getPlaylistIds(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return [];
  const assignments = await prisma.inviteePlaylistAssignment.findMany({
    where: { inviteeId: user.id },
  });
  return assignments.map((a) => a.playlistId);
}

module.exports = { add, getPlaylistIds };
