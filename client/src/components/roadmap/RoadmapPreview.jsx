import { useNavigate } from "react-router-dom";
import { Map, ArrowRight, Milestone as MilestoneIcon } from "lucide-react";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";

// ─── Roadmap Preview ────────────────────────────────────
//
// Shown on the Roadmap tab of the detail page.
// For now, shows a placeholder since the roadmap service
// isn't implemented yet. Will show milestone summary later.

export default function RoadmapPreview({ ideaId }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Roadmap</h3>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(`/ideas/${ideaId}/roadmap`)}
        >
          Open Full Roadmap
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <EmptyState
        icon={MilestoneIcon}
        title="Roadmap coming soon"
        description="Plan your MVP milestones and track tasks. The full roadmap builder will be available here."
        actionLabel="Open Roadmap"
        onAction={() => navigate(`/ideas/${ideaId}/roadmap`)}
      />
    </div>
  );
}
