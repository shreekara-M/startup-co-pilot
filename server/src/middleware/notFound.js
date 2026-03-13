const ApiError = require("../utils/ApiError");

/**
 * 404 catch-all for routes that don't match anything.
 * Place AFTER all routes, BEFORE errorHandler.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
