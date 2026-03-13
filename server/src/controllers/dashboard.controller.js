const catchAsync = require("../utils/catchAsync");
const dashboardService = require("../services/dashboard.service");

/** GET /api/dashboard/stats */
const getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats(req.user.id);
  res.json({ status: "success", data: stats });
});

module.exports = { getStats };
