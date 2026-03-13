import {
  Calendar,
  Clock,
  Milestone,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";

// ─── Idea Overview ──────────────────────────────────────
//
// Quick-glance info cards shown on the Overview tab.
// Displays: timestamps, milestone count, details completion status.

export default function IdeaOverview({ idea }) {
  const hasDetails = idea.details !== null && idea.details !== undefined;

  const infoItems = [
    {
      icon: Calendar,
      label: "Created",
      value: formatDate(idea.createdAt),
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: Clock,
      label: "Last Updated",
      value: formatDate(idea.updatedAt),
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: Milestone,
      label: "Milestones",
      value: idea._count?.milestones ?? idea.milestoneCount ?? 0,
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: hasDetails ? CheckCircle2 : AlertCircle,
      label: "Startup Details",
      value: hasDetails ? "Completed" : "Not filled yet",
      color: hasDetails
        ? "text-green-600 bg-green-50"
        : "text-gray-500 bg-gray-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Pitch card */}
      {idea.pitch && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              Elevator Pitch
            </h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{idea.pitch}</p>
        </div>
      )}

      {/* Details preview (if filled) */}
      {hasDetails && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Startup Details Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {idea.details.problem && (
              <DetailPreviewItem label="Problem" value={idea.details.problem} />
            )}
            {idea.details.solution && (
              <DetailPreviewItem
                label="Solution"
                value={idea.details.solution}
              />
            )}
            {idea.details.targetAudience && (
              <DetailPreviewItem
                label="Target Audience"
                value={idea.details.targetAudience}
              />
            )}
            {idea.details.revenueModel && (
              <DetailPreviewItem
                label="Revenue Model"
                value={idea.details.revenueModel}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPreviewItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
    </div>
  );
}
