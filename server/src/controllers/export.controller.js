const catchAsync = require("../utils/catchAsync");
const exportService = require("../services/export.service");

/** GET /api/ideas/:id/export — aggregated data for PDF */
const getData = catchAsync(async (req, res) => {
  const data = await exportService.getExportData(req.user.id, req.params.id);
  res.json({ status: "success", data });
});

/** POST /api/ideas/:id/export — log that user exported */
const logExport = catchAsync(async (req, res) => {
  const record = await exportService.logExport(
    req.user.id, req.params.id, req.body.format
  );
  res.status(201).json({ status: "success", data: record });
});

/** GET /api/ideas/:id/export/history */
const getHistory = catchAsync(async (req, res) => {
  const history = await exportService.getHistory(req.user.id, req.params.id);
  res.json({ status: "success", data: history });
});

module.exports = { getData, logExport, getHistory };
