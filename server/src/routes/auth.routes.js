const { Router } = require("express");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = Router();

// ─── Auth-Specific Rate Limiter ─────────────────────────
//
// MUCH stricter than the global API limiter (100/15min).
// Auth endpoints are the #1 brute-force target.
//
// 10 attempts per 15 minutes per IP.
// After that, attacker must wait — no matter what.

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts
  standardHeaders: true,     // Send RateLimit-* headers
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many attempts, please try again after 15 minutes",
  },
});

// ─── Validation Schemas ─────────────────────────────────

const signupSchema = {
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be under 100 characters")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255)
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be under 100 characters"),
      // Why max 100? bcrypt has a 72-byte limit internally.
      // Also prevents DoS via extremely long passwords that
      // take seconds to hash.
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(1, "Password is required")
      .max(100),
  }),
};

// ─── Routes ─────────────────────────────────────────────
//
//  POST /api/auth/signup  → public, rate limited
//  POST /api/auth/login   → public, rate limited
//  GET  /api/auth/me      → protected (requires valid JWT)

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
