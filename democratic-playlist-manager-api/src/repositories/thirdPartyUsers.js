const prisma = require("../database/prismaClient");

async function add(providerKey, { spotifyId, email }) {
  await prisma.user.create({
    data: { email, spotifyId, userType: "host" },
  });
}

async function get(providerKey) {
  const spotifyId = providerKey.replace("spotify:", "");
  return prisma.user.findUnique({ where: { spotifyId } });
}

module.exports = { add, get };
