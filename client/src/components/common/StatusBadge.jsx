// ─── Status Badge ───────────────────────────────────────
//
// Colored pill for idea status (draft/active/archived)
// and task status (todo/in_progress/done).

const styles = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-amber-100 text-amber-700",
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  pending: "bg-gray-100 text-gray-700",
};

const labels = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  completed: "Completed",
  pending: "Pending",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${styles[status] || "bg-gray-100 text-gray-700"}
      `}
    >
      {labels[status] || status}
    </span>
  );
}
