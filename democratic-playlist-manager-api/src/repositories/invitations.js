const prisma = require("../database/prismaClient");

async function add(inviteToken, playlistId, playlistName) {
  await prisma.invitation.create({ data: { inviteToken, playlistId, playlistName } });
}

async function get(inviteToken) {
  return prisma.invitation.findUnique({ where: { inviteToken } });
}

async function getByPlaylistId(playlistId) {
  return prisma.invitation.findFirst({ where: { playlistId } });
}

module.exports = { add, get, getByPlaylistId };
