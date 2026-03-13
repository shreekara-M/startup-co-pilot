/**
 * Custom error class for API errors.
 *
 * Throw this anywhere in controller/service code.
 * The errorHandler middleware catches it and sends
 * a clean JSON response with the right status code.
 *
 *   throw new ApiError(404, "Idea not found");
 *   throw ApiError.unauthorized("Invalid password");
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request") {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }

  static notFound(msg = "Not found") {
    return new ApiError(404, msg);
  }

  static conflict(msg = "Conflict") {
    return new ApiError(409, msg);
  }
}

module.exports = ApiError;
