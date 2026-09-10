import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow localhost dev servers + any Vercel deployment of this project
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.vercel\.app$/,
  /\.up\.railway\.app$/,
];

if (process.env.FRONTEND_URL) {
  ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((pattern) =>
        typeof pattern === "string" ? origin === pattern : pattern.test(origin)
      );
      if (allowed) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check endpoints (for Railway / monitoring) ────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Medi-SaaS-Suite API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Medi-SaaS-Suite API",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", router);

export default app;
