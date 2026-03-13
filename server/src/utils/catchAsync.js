/**
 * Wraps an async route handler so that errors
 * automatically go to the errorHandler middleware.
 *
 * Without this, every controller would need try/catch.
 *
 *   router.get("/ideas", catchAsync(async (req, res) => {
 *     const ideas = await ideaService.list(req.user.id);
 *     res.json({ status: "success", data: ideas });
 *   }));
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
