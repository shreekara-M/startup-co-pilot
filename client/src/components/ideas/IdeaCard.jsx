import { useNavigate } from "react-router-dom";
import { Milestone, Calendar, ArrowRight } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/formatDate";

// ─── Idea Card ──────────────────────────────────────────
//
// Displayed in the ideas list grid.
// Shows: title, pitch (truncated), status badge, milestone count, date.
// Clickable → navigates to /ideas/:id

export default function IdeaCard({ idea }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/ideas/${idea.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5
                 hover:border-blue-300 hover:shadow-md
                 transition-all duration-200 cursor-pointer group"
    >
      {/* Top row: title + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {idea.title}
        </h3>
        <StatusBadge status={idea.status} />
      </div>

      {/* Pitch */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px]">
        {idea.pitch || "No pitch yet — click to add one"}
      </p>

      {/* Bottom row: meta info */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Milestone count */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Milestone className="h-3.5 w-3.5" />
            <span>{idea.milestoneCount || 0} milestones</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(idea.updatedAt)}</span>
          </div>
        </div>

        {/* Arrow icon on hover */}
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
}
