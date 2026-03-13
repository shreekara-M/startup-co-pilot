// ─── Date Formatting ────────────────────────────────────
//
// Converts ISO date string to readable format.
// "2026-01-15T10:30:00Z" → "Jan 15, 2026"

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Relative time: "2 days ago", "just now", etc.
export function timeAgo(dateStr) {
  if (!dateStr) return "";

  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(dateStr);
}
