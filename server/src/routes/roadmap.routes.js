const { Router } = require("express");
const { z } = require("zod");
const roadmapController = require("../controllers/roadmap.controller");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

// mergeParams: true → gives us access to :id from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

// ─── MongoDB ObjectId validator ─────────────────────────
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

// ─── Param Schemas ──────────────────────────────────────

const ideaParam = {
  params: z.object({
    id: objectId,
  }),
};

const milestoneParam = {
  params: z.object({
    id: objectId,
    milestoneId: objectId,
  }),
};

const taskParam = {
  params: z.object({
    id: objectId,
    milestoneId: objectId,
    taskId: objectId,
  }),
};

// ─── Milestone Validation ───────────────────────────────

const createMilestoneSchema = {
  ...ideaParam,
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    phase: z.enum(["mvp", "v1", "v2", "future"]).default("mvp"),
    targetDate: z.string().optional(), // ISO date string
  }),
};

const updateMilestoneSchema = {
  ...milestoneParam,
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    phase: z.enum(["mvp", "v1", "v2", "future"]).optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
    sortOrder: z.number().int().min(0).optional(),
    targetDate: z.string().optional(),
  }),
};

// ─── Task Validation ────────────────────────────────────

const createTaskSchema = {
  ...milestoneParam,
  body: z.object({
    title: z.string().min(1).max(300),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
  }),
};

const updateTaskSchema = {
  ...taskParam,
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
};

// ─── Milestone Routes ───────────────────────────────────

router.get("/", validate(ideaParam), roadmapController.getMilestones);
router.post("/generate", validate(ideaParam), roadmapController.generateWithAI);
router.post("/", validate(createMilestoneSchema), roadmapController.createMilestone);
router.put("/:milestoneId", validate(updateMilestoneSchema), roadmapController.updateMilestone);
router.delete("/:milestoneId", validate(milestoneParam), roadmapController.deleteMilestone);

// ─── Task Routes (nested under milestone) ───────────────

router.post("/:milestoneId/tasks", validate(createTaskSchema), roadmapController.createTask);
router.put("/:milestoneId/tasks/:taskId", validate(updateTaskSchema), roadmapController.updateTask);
router.delete("/:milestoneId/tasks/:taskId", validate(taskParam), roadmapController.deleteTask);

module.exports = router;
