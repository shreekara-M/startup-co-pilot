const { prisma } = require("../config/db");
const ApiError = require("../utils/ApiError");

// ─── HELPER: Verify idea exists AND belongs to this user ─────
//
// Used by every method except list() and create().
// Prevents User A from reading/editing/deleting User B's ideas.
//
// WHY a helper?
//   Without this, every method would repeat the same 10 lines.
//   One place to enforce ownership = one place to audit.

async function findUserIdea(userId, ideaId, includeDetails = false) {
  const idea = await prisma.startupIdea.findUnique({
    where: { id: ideaId },
    include: includeDetails ? { details: true } : undefined,
  });

  // Idea doesn't exist at all
  if (!idea) {
    throw ApiError.notFound("Startup idea not found");
  }

  // Idea exists but belongs to someone else
  // SECURITY: Same 404 message — don't reveal that the idea exists
  //           to a user who doesn't own it. This prevents IDOR attacks.
  if (idea.userId !== userId) {
    throw ApiError.notFound("Startup idea not found");
  }

  return idea;
}

// ─── LIST ALL IDEAS ──────────────────────────────────────────
//
// Returns paginated list of the user's ideas.
// Optional filter by status (draft/active/archived).
// Ordered by most recently updated first.
//
// Response shape:
//   {
//     ideas: [...],
//     pagination: { page, limit, total, totalPages }
//   }

async function list(userId, { status, page = 1, limit = 10 }) {
  // Build WHERE clause dynamically
  const where = { userId };
  if (status) {
    where.status = status;
  }

  // Run count and data queries in parallel for performance
  const [total, ideas] = await Promise.all([
    prisma.startupIdea.count({ where }),
    prisma.startupIdea.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      // Include details existence check (not full data — that's for getById)
      include: {
        details: {
          select: { id: true },
        },
        _count: {
          select: { milestones: true },
        },
      },
    }),
  ]);

  // Transform: add hasDetails flag and milestoneCount for the list UI
  const transformed = ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    pitch: idea.pitch,
    status: idea.status,
    hasDetails: idea.details !== null,
    milestoneCount: idea._count.milestones,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  }));

  return {
    ideas: transformed,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── CREATE IDEA ─────────────────────────────────────────────
//
// Creates a new startup idea with title and optional pitch.
// Status defaults to "draft".
// User ID comes from the JWT (req.user.id).

async function create(userId, { title, pitch }) {
  const idea = await prisma.startupIdea.create({
    data: {
      userId,
      title: title.trim(),
      pitch: pitch?.trim() || null,
      status: "draft",
    },
  });

  return idea;
}

// ─── GET SINGLE IDEA ─────────────────────────────────────────
//
// Returns the idea WITH its structured details (1:1 join).
// This is the "detail page" query — more data than the list.

async function getById(userId, ideaId) {
  const idea = await findUserIdea(userId, ideaId, true);

  // Parse JSON strings into actual arrays for the frontend
  if (idea.details) {
    idea.details.competitors = safeJsonParse(idea.details.competitors);
    idea.details.teamNeeds = safeJsonParse(idea.details.teamNeeds);
  }

  return idea;
}

// ─── UPDATE IDEA ─────────────────────────────────────────────
//
// Updates title, pitch, and/or status.
// Only the fields sent in the request body are updated.
// Prisma ignores undefined fields automatically.

async function update(userId, ideaId, data) {
  // Verify ownership first
  await findUserIdea(userId, ideaId);

  // Build update payload — only include fields that were actually sent
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.pitch !== undefined) updateData.pitch = data.pitch?.trim() || null;
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await prisma.startupIdea.update({
    where: { id: ideaId },
    data: updateData,
  });

  return updated;
}

// ─── DELETE IDEA ─────────────────────────────────────────────
//
// Deletes the idea AND all related data via cascade:
//   → startup_details (1:1)
//   → milestones → tasks (nested cascade)
//   → export_history
//
// Prisma's onDelete: Cascade in the schema handles this.
// We don't need to manually delete children.

async function remove(userId, ideaId) {
  // Verify ownership first
  await findUserIdea(userId, ideaId);

  await prisma.startupIdea.delete({
    where: { id: ideaId },
  });
}

// ─── GET STARTUP DETAILS ─────────────────────────────────────
//
// Returns the structured details form data for an idea.
// If no details exist yet (user hasn't filled the form),
// returns null — the frontend shows an empty form.

async function getDetails(userId, ideaId) {
  // Verify idea ownership
  await findUserIdea(userId, ideaId);

  const details = await prisma.startupDetails.findUnique({
    where: { ideaId },
  });

  // Parse JSON strings for the frontend
  if (details) {
    details.competitors = safeJsonParse(details.competitors);
    details.teamNeeds = safeJsonParse(details.teamNeeds);
  }

  return details;
}

// ─── UPSERT STARTUP DETAILS ─────────────────────────────────
//
// Create OR update the structured details for an idea.
//
// WHY upsert?
//   The first time the user fills the details form → CREATE.
//   Every subsequent save → UPDATE.
//   The frontend doesn't need to know which one — it just sends PUT.
//   Prisma's upsert handles the logic atomically.

async function upsertDetails(userId, ideaId, data) {
  // Verify idea ownership
  await findUserIdea(userId, ideaId);

  // Stringify arrays back to JSON for SQLite storage
  const competitors =
    data.competitors !== undefined
      ? JSON.stringify(data.competitors)
      : undefined;
  const teamNeeds =
    data.teamNeeds !== undefined
      ? JSON.stringify(data.teamNeeds)
      : undefined;

  const details = await prisma.startupDetails.upsert({
    where: { ideaId },
    // Fields for creating a new details row
    create: {
      ideaId,
      problem: data.problem,
      solution: data.solution,
      targetAudience: data.targetAudience,
      uniqueValue: data.uniqueValue,
      revenueModel: data.revenueModel,
      marketSize: data.marketSize,
      competitors: competitors || "[]",
      teamNeeds: teamNeeds || "[]",
      budget: data.budget,
    },
    // Fields for updating an existing details row
    update: {
      problem: data.problem,
      solution: data.solution,
      targetAudience: data.targetAudience,
      uniqueValue: data.uniqueValue,
      revenueModel: data.revenueModel,
      marketSize: data.marketSize,
      ...(competitors !== undefined && { competitors }),
      ...(teamNeeds !== undefined && { teamNeeds }),
      budget: data.budget,
    },
  });

  // Parse JSON back for the response
  details.competitors = safeJsonParse(details.competitors);
  details.teamNeeds = safeJsonParse(details.teamNeeds);

  return details;
}

// ─── HELPER: Safe JSON parse ─────────────────────────────────
//
// competitors and teamNeeds are stored as JSON strings in SQLite.
// This safely parses them, returning [] if the string is invalid.

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

module.exports = { list, create, getById, update, remove, getDetails, upsertDetails };
