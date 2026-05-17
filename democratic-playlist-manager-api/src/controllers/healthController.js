const prisma = require("../database/prismaClient");

async function healthCheck(req, res) {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({ message: "Database connection successful" });
}

module.exports = { healthCheck };
