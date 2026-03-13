// ─── Status Filter Tabs ─────────────────────────────────
//
// Horizontal tab bar to filter ideas by status.
// null = show all ideas.

const filters = [
  { value: null, label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export default function IdeaStatusFilter({ activeFilter, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {filters.map((filter) => (
        <button
          key={filter.label}
          onClick={() => onChange(filter.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer
            ${
              activeFilter === filter.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
