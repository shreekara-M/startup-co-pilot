// const { prisma } = require("../config/db");
// const ApiError = require("../utils/ApiError");

/**
 * Export service — aggregated data for PDF + export audit log.
 */

async function getExportData(userId, ideaId) {
  // TODO: verify ownership, fetch idea + details + milestones + tasks in one query
  // Return a flat object ready for PDF generation on the frontend
}

async function logExport(userId, ideaId, format) {
  // TODO: verify ownership, create export_history record
}

async function getHistory(userId, ideaId) {
  // TODO: verify ownership, return export history ordered by date desc
}

module.exports = { getExportData, logExport, getHistory };
