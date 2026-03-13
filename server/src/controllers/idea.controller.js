const catchAsync = require("../utils/catchAsync");
const ideaService = require("../services/idea.service");

/** GET /api/ideas */
const list = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await ideaService.list(req.user.id, { status, page, limit });
  res.json({ status: "success", data: result });
});

/** POST /api/ideas */
const create = catchAsync(async (req, res) => {
  const idea = await ideaService.create(req.user.id, req.body);
  res.status(201).json({ status: "success", data: idea });
});

/** GET /api/ideas/:id */
const getById = catchAsync(async (req, res) => {
  const idea = await ideaService.getById(req.user.id, req.params.id);
  res.json({ status: "success", data: idea });
});

/** PUT /api/ideas/:id */
const update = catchAsync(async (req, res) => {
  const idea = await ideaService.update(req.user.id, req.params.id, req.body);
  res.json({ status: "success", data: idea });
});

/** DELETE /api/ideas/:id */
const remove = catchAsync(async (req, res) => {
  await ideaService.remove(req.user.id, req.params.id);
  res.status(204).send();
});

/** GET /api/ideas/:id/details */
const getDetails = catchAsync(async (req, res) => {
  const details = await ideaService.getDetails(req.user.id, req.params.id);
  res.json({ status: "success", data: details });
});

/** PUT /api/ideas/:id/details */
const upsertDetails = catchAsync(async (req, res) => {
  const details = await ideaService.upsertDetails(req.user.id, req.params.id, req.body);
  res.json({ status: "success", data: details });
});

module.exports = { list, create, getById, update, remove, getDetails, upsertDetails };
