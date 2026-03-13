const catchAsync = require("../utils/catchAsync");
const roadmapService = require("../services/roadmap.service");

// ─── Milestones ─────────────────────────────────────────────

/** GET /api/ideas/:id/roadmap */
const getMilestones = catchAsync(async (req, res) => {
  const data = await roadmapService.getMilestones(req.user.id, req.params.id);
  res.json({ status: "success", data });
});

/** POST /api/ideas/:id/roadmap */
const createMilestone = catchAsync(async (req, res) => {
  const milestone = await roadmapService.createMilestone(
    req.user.id, req.params.id, req.body
  );
  res.status(201).json({ status: "success", data: milestone });
});

/** PUT /api/ideas/:id/roadmap/:milestoneId */
const updateMilestone = catchAsync(async (req, res) => {
  const milestone = await roadmapService.updateMilestone(
    req.user.id, req.params.id, req.params.milestoneId, req.body
  );
  res.json({ status: "success", data: milestone });
});

/** DELETE /api/ideas/:id/roadmap/:milestoneId */
const deleteMilestone = catchAsync(async (req, res) => {
  await roadmapService.deleteMilestone(
    req.user.id, req.params.id, req.params.milestoneId
  );
  res.status(204).send();
});

// ─── Tasks ──────────────────────────────────────────────────

/** POST /api/ideas/:id/roadmap/:milestoneId/tasks */
const createTask = catchAsync(async (req, res) => {
  const task = await roadmapService.createTask(
    req.user.id, req.params.id, req.params.milestoneId, req.body
  );
  res.status(201).json({ status: "success", data: task });
});

/** PUT /api/ideas/:id/roadmap/:milestoneId/tasks/:taskId */
const updateTask = catchAsync(async (req, res) => {
  const task = await roadmapService.updateTask(
    req.user.id, req.params.id, req.params.milestoneId, req.params.taskId, req.body
  );
  res.json({ status: "success", data: task });
});

/** DELETE /api/ideas/:id/roadmap/:milestoneId/tasks/:taskId */
const deleteTask = catchAsync(async (req, res) => {
  await roadmapService.deleteTask(
    req.user.id, req.params.id, req.params.milestoneId, req.params.taskId
  );
  res.status(204).send();
});

// ─── AI Generation ──────────────────────────────────────

/** POST /api/ideas/:id/roadmap/generate */
const generateWithAI = catchAsync(async (req, res) => {
  const milestones = await roadmapService.generateWithAI(
    req.user.id, req.params.id
  );
  res.status(201).json({ status: "success", data: milestones });
});

module.exports = {
  getMilestones, createMilestone, updateMilestone, deleteMilestone,
  createTask, updateTask, deleteTask,
  generateWithAI,
};
