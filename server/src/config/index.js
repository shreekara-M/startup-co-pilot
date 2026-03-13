const dotenv = require("dotenv");
const path = require("path");

// Load .env BEFORE anything else reads process.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  db: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  openaiApiKey: process.env.OPENAI_API_KEY,

  // Support comma-separated origins: "http://localhost:5173,http://localhost:5174"
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : ["http://localhost:5173"],
};

// ─── Crash early if critical vars are missing ────────────────
const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required env variable: ${key}`);
    console.error(`Copy .env.example to .env and fill in the values.`);
    process.exit(1);
  }
}

module.exports = config;
