const { Router } = require("express");
const { z } = require("zod");
const ideaController = require("../controllers/idea.controller");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = Router();

// All idea routes require login
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────

const idParam = {
  params: z.object({
    id: z.string().uuid("Invalid idea ID"),
  }),
};

const createSchema = {
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    pitch: z.string().max(1000).optional(),
  }),
};

const updateSchema = {
  ...idParam,
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    pitch: z.string().max(1000).optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
  }),
};

const listSchema = {
  query: z.object({
    status: z.enum(["draft", "active", "archived"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
};

const detailsSchema = {
  ...idParam,
  body: z.object({
    problem: z.string().optional(),
    solution: z.string().optional(),
    targetAudience: z.string().optional(),
    uniqueValue: z.string().optional(),
    revenueModel: z.string().max(100).optional(),
    marketSize: z.string().max(100).optional(),
    competitors: z.array(z.string()).optional(),
    teamNeeds: z.array(z.string()).optional(),
    budget: z.number().min(0).optional(),
  }),
};

// ─── CRUD Routes ────────────────────────────────────────

router.get("/", validate(listSchema), ideaController.list);
router.post("/", validate(createSchema), ideaController.create);
router.get("/:id", validate(idParam), ideaController.getById);
router.put("/:id", validate(updateSchema), ideaController.update);
router.delete("/:id", validate(idParam), ideaController.remove);

// ─── Details (nested under idea) ────────────────────────

router.get("/:id/details", validate(idParam), ideaController.getDetails);
router.put("/:id/details", validate(detailsSchema), ideaController.upsertDetails);

module.exports = router;
