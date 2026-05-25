const prisma = require("../database/prismaClient");

async function upsert(email, { accessToken, refreshToken }) {
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.spotifyToken.upsert({
    where: { userId: user.id },
    update: { accessToken, refreshToken },
    create: { userId: user.id, accessToken, refreshToken },
  });
}

async function getByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { spotifyToken: true },
  });
  return user?.spotifyToken ?? null;
}

async function updateAccessToken(email, accessToken) {
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.spotifyToken.update({
    where: { userId: user.id },
    data: { accessToken },
  });
}

module.exports = { upsert, getByEmail, updateAccessToken };
