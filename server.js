require("dotenv").config({ quiet: true });

const app = require("./app");
const { closeDatabase, connectDatabase } = require("./config/database");
const logger = require("./config/logger");

const port = Number(process.env.PORT) || 8000;
let server;
let isShuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  const forceShutdownTimer = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out");
    process.exit(1);
  }, 10000);
  forceShutdownTimer.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await closeDatabase();
  } catch (error) {
    logger.error({ err: error }, "Failed to close the database connection");
    exitCode = 1;
  }

  clearTimeout(forceShutdownTimer);
  process.exit(exitCode);
};

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.fatal({ err: error }, "Unhandled promise rejection");
  void shutdown("unhandledRejection", 1);
});

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

const startServer = async () => {
  try {
    await connectDatabase();
    server = app.listen(port, () => {
      logger.info(
        { port, environment: process.env.NODE_ENV || "development" },
        "Server is running successfully"
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Application startup failed");
    process.exit(1);
  }
};

void startServer();
