import app from "./app";
import { logger } from "./lib/logger";


process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
});

const primaryPort = Number(process.env.PORT || process.env.Port || 8080);
const targetPorts = Array.from(new Set([primaryPort, 5000, 8080, 3000])).filter(
  (p) => !Number.isNaN(p) && p > 0
);

const servers: any[] = [];

for (const p of targetPorts) {
  try {
    const s = app.listen(p, () => {
      logger.info({ port: p }, `Server listening on port ${p}`);
    });
    s.on("error", (err: any) => {
      if (err.code !== "EADDRINUSE") {
        logger.warn({ port: p, err: err.message }, "Server listen warning");
      }
    });
    servers.push(s);
  } catch {
    // Ignore if already bound
  }
}

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  for (const s of servers) {
    try {
      s.close();
    } catch {
      // ignore
    }
  }
  process.exit(0);
});


