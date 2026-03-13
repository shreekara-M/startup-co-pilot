// const { prisma } = require("../config/db");

/**
 * Dashboard service — aggregated stats for the planning dashboard.
 */

async function getStats(userId) {
  // TODO: Return aggregated counts:
  // {
  //   totalIdeas: 5,
  //   ideasByStatus: { draft: 2, active: 2, archived: 1 },
  //   totalMilestones: 12,
  //   totalTasks: 34,
  //   tasksByStatus: { todo: 15, in_progress: 10, done: 9 },
  //   recentIdeas: [ ... last 5 updated ideas ... ]
  // }
}

module.exports = { getStats };
