import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT || process.env.Port || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
});

const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, `Server listening on 0.0.0.0:${port}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});


