const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");

// ─── HELPER: Generate JWT Token ─────────────────────────
//
// Payload contains ONLY non-sensitive data:
//   sub   → user ID (standard JWT claim for "subject")
//   email → for display in middleware without DB lookup
//
// What we NEVER put in a token:
//   - password hash
//   - full user object
//   - role/permissions (we'd re-check from DB instead)

function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
}

// ─── HELPER: Strip password from user object ────────────
//
// Prisma returns ALL fields by default.
// This ensures the password hash NEVER leaks to the client.

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// ─── SIGNUP ─────────────────────────────────────────────
//
// Flow:
//   1. Normalize email (lowercase + trim)
//   2. Check if email already taken
//   3. Hash password with bcrypt
//   4. Create user row
//   5. Generate JWT
//   6. Return clean user + token

async function signup({ name, email, password }) {
  // 1. Normalize — prevents "John@Gmail.com" and "john@gmail.com" as two accounts
  const normalizedEmail = email.toLowerCase().trim();

  // 2. Check uniqueness before hitting a DB constraint error
  //    This gives us a user-friendly error message
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  // 3. Hash password
  //    bcrypt adds a random salt automatically
  //    cost factor 10 = ~100ms to hash (good balance of speed vs security)
  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
  });

  // 5. Generate token
  const token = generateToken(user);

  // 6. Return (password stripped)
  return {
    user: sanitizeUser(user),
    token,
  };
}

// ─── LOGIN ──────────────────────────────────────────────
//
// Flow:
//   1. Normalize email
//   2. Find user by email
//   3. Compare password with stored hash
//   4. Generate JWT
//   5. Return clean user + token
//
// SECURITY: Use the same error message for "email not found"
// and "wrong password" — prevents attackers from discovering
// which emails are registered (user enumeration attack).

async function login({ email, password }) {
  // 1. Normalize
  const normalizedEmail = email.toLowerCase().trim();

  // 2. Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // 3. Verify password (or fail with generic message)
  //    bcrypt.compare is timing-safe — takes the same time
  //    whether the email exists or not (if user is null, we
  //    compare against a dummy hash to prevent timing attacks)
  const DUMMY_HASH = "$2b$10$dummyhashtopreventtimingattackspadding";

  const isPasswordValid = await bcrypt.compare(
    password,
    user ? user.password : DUMMY_HASH
  );

  if (!user || !isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // 4. Generate token
  const token = generateToken(user);

  // 5. Return
  return {
    user: sanitizeUser(user),
    token,
  };
}

// ─── GET CURRENT USER ───────────────────────────────────
//
// Called after auth middleware has verified the JWT.
// req.user.id is already available — just fetch the profile.

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return sanitizeUser(user);
}

module.exports = { signup, login, getMe };
