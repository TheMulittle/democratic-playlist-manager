const prisma = require("../database/prismaClient");

async function add(email, { passwordHash }) {
  await prisma.user.create({
    data: { email, passwordHash, userType: "invitee" },
  });
}

async function get(email) {
  return prisma.user.findUnique({ where: { email } });
}

module.exports = { add, get };
