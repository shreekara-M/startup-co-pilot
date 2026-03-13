const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");

// ─── Roadmap Service ────────────────────────────────────
//
// Milestones and tasks within a startup idea.
// Every method verifies the ownership chain:
//   user → idea → milestone → task
// Same 404 whether "not found" or "not yours" (prevents IDOR).

// ─── Helpers ─────────────────────────────────────────────

/** Verify user owns the idea. Returns the idea or throws 404. */
async function findUserIdea(userId, ideaId) {
  const idea = await prisma.startupIdea.findUnique({
    where: { id: ideaId },
  });
  if (!idea || idea.userId !== userId) {
    throw ApiError.notFound("Startup idea not found");
  }
  return idea;
}

/** Verify milestone belongs to the idea. Returns milestone or throws 404. */
async function findIdeaMilestone(ideaId, milestoneId) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });
  if (!milestone || milestone.ideaId !== ideaId) {
    throw ApiError.notFound("Milestone not found");
  }
  return milestone;
}

/** Verify task belongs to the milestone. Returns task or throws 404. */
async function findMilestoneTask(milestoneId, taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task || task.milestoneId !== milestoneId) {
    throw ApiError.notFound("Task not found");
  }
  return task;
}

// ─── Milestones ─────────────────────────────────────────

async function getMilestones(userId, ideaId) {
  await findUserIdea(userId, ideaId);

  const milestones = await prisma.milestone.findMany({
    where: { ideaId },
    orderBy: [{ phase: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      tasks: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return milestones;
}

async function createMilestone(userId, ideaId, data) {
  await findUserIdea(userId, ideaId);

  // Auto-calculate sortOrder: place new milestone at the end of its phase
  const lastInPhase = await prisma.milestone.findFirst({
    where: { ideaId, phase: data.phase || "mvp" },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextOrder = (lastInPhase?.sortOrder ?? -1) + 1;

  const milestone = await prisma.milestone.create({
    data: {
      ideaId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      phase: data.phase || "mvp",
      targetDate: data.targetDate || null,
      sortOrder: nextOrder,
    },
    include: { tasks: true },
  });

  return milestone;
}

async function updateMilestone(userId, ideaId, milestoneId, data) {
  await findUserIdea(userId, ideaId);
  await findIdeaMilestone(ideaId, milestoneId);

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description.trim() || null;
  if (data.phase !== undefined) updateData.phase = data.phase;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.targetDate !== undefined) updateData.targetDate = data.targetDate || null;

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: updateData,
    include: { tasks: true },
  });

  return milestone;
}

async function deleteMilestone(userId, ideaId, milestoneId) {
  await findUserIdea(userId, ideaId);
  await findIdeaMilestone(ideaId, milestoneId);

  await prisma.milestone.delete({ where: { id: milestoneId } });
}

// ─── Tasks ──────────────────────────────────────────────

async function createTask(userId, ideaId, milestoneId, data) {
  await findUserIdea(userId, ideaId);
  await findIdeaMilestone(ideaId, milestoneId);

  // Auto-calculate sortOrder
  const lastTask = await prisma.task.findFirst({
    where: { milestoneId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextOrder = (lastTask?.sortOrder ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      milestoneId,
      title: data.title.trim(),
      priority: data.priority || "medium",
      sortOrder: nextOrder,
    },
  });

  return task;
}

async function updateTask(userId, ideaId, milestoneId, taskId, data) {
  await findUserIdea(userId, ideaId);
  await findIdeaMilestone(ideaId, milestoneId);
  await findMilestoneTask(milestoneId, taskId);

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  return task;
}

async function deleteTask(userId, ideaId, milestoneId, taskId) {
  await findUserIdea(userId, ideaId);
  await findIdeaMilestone(ideaId, milestoneId);
  await findMilestoneTask(milestoneId, taskId);

  await prisma.task.delete({ where: { id: taskId } });
}

// ─── AI Generation ─────────────────────────────────

async function generateWithAI(userId, ideaId) {
  // 1. Verify ownership
  await findUserIdea(userId, ideaId);

  // 2. Fetch idea with details (need full context for AI)
  const ideaService = require("./idea.service");
  const idea = await ideaService.getById(userId, ideaId);

  // 3. Check that the idea has enough info
  if (!idea.details) {
    throw ApiError.badRequest(
      "Please fill in your startup details before generating a roadmap. " +
        "The AI needs your problem, solution, and audience to create a useful plan."
    );
  }

  // 4. Call AI service to get milestones
  const aiService = require("./ai.service");
  const aiMilestones = await aiService.generateRoadmap(idea);

  // 5. Save each milestone and its tasks using existing methods
  const validPhases = ["mvp", "v1", "v2", "future"];
  const validPriorities = ["low", "medium", "high"];

  for (const m of aiMilestones) {
    const phase = validPhases.includes(m.phase) ? m.phase : "mvp";

    const milestone = await createMilestone(userId, ideaId, {
      title: (m.title || "Untitled Milestone").slice(0, 200),
      description: m.description || null,
      phase,
    });

    if (Array.isArray(m.tasks)) {
      for (const t of m.tasks) {
        const priority = validPriorities.includes(t.priority)
          ? t.priority
          : "medium";
        await createTask(userId, ideaId, milestone.id, {
          title: (t.title || "Untitled Task").slice(0, 300),
          priority,
        });
      }
    }
  }

  // 6. Return all milestones with tasks
  return getMilestones(userId, ideaId);
}

module.exports = {
  getMilestones, createMilestone, updateMilestone, deleteMilestone,
  createTask, updateTask, deleteTask,
  generateWithAI,
};
