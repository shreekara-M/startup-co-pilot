const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/auth");

const router = Router();

router.use(authenticate);

// ─── Routes ─────────────────────────────────────────────

router.get("/stats", dashboardController.getStats);

module.exports = router;
