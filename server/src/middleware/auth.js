const jwt = require("jsonwebtoken");
const config = require("../config");
const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");

/**
 * JWT Authentication Middleware
 *
 * What it does:
 *   1. Reads the Authorization header
 *   2. Extracts the token after "Bearer "
 *   3. Verifies signature + expiration with our secret
 *   4. Confirms the user still exists in the database
 *   5. Attaches user info to req.user
 *
 * Why step 4 matters:
 *   A token could be valid but the user could have been
 *   deleted since the token was issued. Without this check,
 *   a deleted user's token keeps working until it expires.
 *
 * After this middleware, controllers can access:
 *   req.user.id    — ObjectId of the authenticated user
 *   req.user.email — user's email address
 */
const authenticate = async (req, _res, next) => {
  try {
    // 1. Get header
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    // 2. Extract token
    const token = header.split(" ")[1];

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Token expired, please login again");
      }
      throw ApiError.unauthorized("Invalid token");
    }

    // 4. Confirm user still exists
    //    Uses select to fetch ONLY the id — not the full row.
    //    This keeps the DB lookup fast and avoids loading the password hash.
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      throw ApiError.unauthorized("User no longer exists");
    }

    // 5. Attach to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
