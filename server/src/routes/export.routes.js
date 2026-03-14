const { Router } = require("express");
const { z } = require("zod");
const exportController = require("../controllers/export.controller");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");

// mergeParams: true → access :id from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

// ─── Validation ─────────────────────────────────────────

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const logExportSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    format: z.enum(["pdf"]).default("pdf"),
  }),
};

// ─── Routes ─────────────────────────────────────────────

router.get("/", exportController.getData);
router.post("/", validate(logExportSchema), exportController.logExport);
router.get("/history", exportController.getHistory);

module.exports = router;
