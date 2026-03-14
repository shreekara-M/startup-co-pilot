const app = require("./app");
const config = require("./config");
const logger = require("./utils/logger");
const { connectDB, disconnectDB } = require("./config/db");

async function start() {
  // 1. Connect to database
  await connectDB();

  // 2. Start Express server
  const server = app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`Database: MongoDB`);
    logger.info(`Health check: http://localhost:${config.port}/health`);
  });

  // 3. Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });

    // Force exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled rejection: " + err.message);
    shutdown("UNHANDLED_REJECTION");
  });
}

start();
