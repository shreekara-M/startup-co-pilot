const config = require("../config");
const logger = require("../utils/logger");

/**
 * Global error handler — MUST be the last middleware in app.js.
 *
 * Catches:
 *   1. ApiError instances → clean JSON with correct status
 *   2. Prisma errors     → mapped to user-friendly messages
 *   3. Unknown errors    → 500 with stack trace in dev only
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || undefined;

  // ── Prisma: unique field already exists ────────
  if (err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.[0] || "field";
    message = `A record with this ${field} already exists`;
  }

  // ── Prisma: record not found ───────────────────
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  // ── Logging ────────────────────────────────────
  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} — ${message}`);
  }

  // ── Response ───────────────────────────────────
  const response = { status: "error", statusCode, message };

  if (errors) response.errors = errors;
  if (config.env === "development" && err.stack) response.stack = err.stack;

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
