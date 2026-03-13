const ApiError = require("../utils/ApiError");

/**
 * Zod validation middleware factory.
 *
 * Takes an object with optional keys: body, params, query.
 * Each key maps to a Zod schema. If validation fails,
 * sends a 400 with field-level error details.
 *
 * Usage in routes:
 *
 *   const { z } = require("zod");
 *
 *   const schema = {
 *     body: z.object({
 *       title: z.string().min(1).max(200),
 *     }),
 *   };
 *
 *   router.post("/ideas", validate(schema), controller.create);
 */
const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        errors.push({
          field: issue.path.join("."),
          message: issue.message,
          source, // "body", "params", or "query"
        });
      });
    } else {
      // Replace raw input with parsed + cleaned data
      req[source] = result.data;
    }
  }

  if (errors.length > 0) {
    const error = ApiError.badRequest("Validation failed");
    error.errors = errors;
    return next(error);
  }

  next();
};

module.exports = validate;
