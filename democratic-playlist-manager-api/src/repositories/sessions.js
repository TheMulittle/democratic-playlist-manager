const prisma = require("../database/prismaClient");

async function add(token, { email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.session.create({
    data: { token, userId: user.id },
  });
}

async function get(token) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { spotifyToken: true } } },
  });
  if (!session) return undefined;
  return {
    email: session.user.email,
    userType: session.user.userType,
    spotifyId: session.user.spotifyId,
    spotifyAccessToken: session.user.spotifyToken?.accessToken,
    spotifyRefreshToken: session.user.spotifyToken?.refreshToken,
  };
}

async function remove(token) {
  await prisma.session.delete({ where: { token } });
}

module.exports = { add, get, remove };
