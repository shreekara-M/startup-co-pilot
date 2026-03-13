const { Router } = require("express");
const authRoutes = require("./auth.routes");
const ideaRoutes = require("./idea.routes");
const roadmapRoutes = require("./roadmap.routes");
const exportRoutes = require("./export.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = Router();

/**
 * ┌────────────────────────────────────────────────────────────┐
 * │                    API ROUTE MAP                           │
 * ├────────────────────────────────────────────────────────────┤
 * │                                                            │
 * │  AUTH (public)                                             │
 * │  POST   /api/auth/signup                                   │
 * │  POST   /api/auth/login                                    │
 * │  GET    /api/auth/me                      (protected)      │
 * │                                                            │
 * │  IDEAS (protected)                                         │
 * │  GET    /api/ideas                                         │
 * │  POST   /api/ideas                                         │
 * │  GET    /api/ideas/:id                                     │
 * │  PUT    /api/ideas/:id                                     │
 * │  DELETE /api/ideas/:id                                     │
 * │  GET    /api/ideas/:id/details                             │
 * │  PUT    /api/ideas/:id/details                             │
 * │                                                            │
 * │  ROADMAP (protected)                                       │
 * │  GET    /api/ideas/:id/roadmap                             │
 * │  POST   /api/ideas/:id/roadmap                             │
 * │  PUT    /api/ideas/:id/roadmap/:milestoneId                │
 * │  DELETE /api/ideas/:id/roadmap/:milestoneId                │
 * │  POST   /api/ideas/:id/roadmap/:milestoneId/tasks          │
 * │  PUT    /api/ideas/:id/roadmap/:milestoneId/tasks/:taskId  │
 * │  DELETE /api/ideas/:id/roadmap/:milestoneId/tasks/:taskId  │
 * │                                                            │
 * │  EXPORT (protected)                                        │
 * │  GET    /api/ideas/:id/export                              │
 * │  POST   /api/ideas/:id/export                              │
 * │  GET    /api/ideas/:id/export/history                      │
 * │                                                            │
 * │  DASHBOARD (protected)                                     │
 * │  GET    /api/dashboard/stats                               │
 * │                                                            │
 * │  TOTAL: 20 endpoints                                       │
 * └────────────────────────────────────────────────────────────┘
 */

router.use("/auth", authRoutes);
router.use("/ideas", ideaRoutes);
router.use("/ideas/:id/roadmap", roadmapRoutes);
router.use("/ideas/:id/export", exportRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
