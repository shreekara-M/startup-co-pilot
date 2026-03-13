const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─────────────────────────────────────────────────────────
// 1. SECURITY
// ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// ─────────────────────────────────────────────────────────
// 2. BODY PARSING
// ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────
// 3. REQUEST LOGGING
// ─────────────────────────────────────────────────────────
if (config.env === "development") {
  app.use(morgan("dev"));
}

// ─────────────────────────────────────────────────────────
// 4. RATE LIMITING
// ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    status: "error",
    message: "Too many requests, try again later",
  },
});
app.use("/api", limiter);

// ─────────────────────────────────────────────────────────
// 5. HEALTH CHECK
// ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────
// 6. API ROUTES
// ─────────────────────────────────────────────────────────
app.use("/api", routes);

// ─────────────────────────────────────────────────────────
// 7. ERROR HANDLING (must be last)
// ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
