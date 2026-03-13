const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

// ─── Singleton: one PrismaClient for the whole app ───────────
// In dev, nodemon restarts clear this naturally.
// The global trick prevents multiple clients during hot-reload.

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ log: ["error"] });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ log: ["warn", "error"] });
  }
  prisma = global.__prisma;
}

async function connectDB() {
  try {
    await prisma.$connect();
    logger.info("SQLite database connected");
  } catch (error) {
    logger.error("Database connection failed: " + error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}

module.exports = { prisma, connectDB, disconnectDB };
