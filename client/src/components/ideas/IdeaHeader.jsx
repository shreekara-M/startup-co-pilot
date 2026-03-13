import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Map, FileDown } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

// ─── Idea Header ────────────────────────────────────────
//
// Top section of the detail page.
// Shows: back arrow, title, status badge, action buttons.
// Actions: Edit, Delete, Roadmap, Export.

export default function IdeaHeader({ idea, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/ideas")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700
                   transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ideas
      </button>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {idea.title}
            </h1>
            <StatusBadge status={idea.status} />
          </div>
          {idea.pitch && (
            <p className="text-sm text-gray-500 max-w-2xl">{idea.pitch}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/ideas/${idea.id}/roadmap`)}
          >
            <Map className="h-4 w-4" />
            Roadmap
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/ideas/${idea.id}/export`)}
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
