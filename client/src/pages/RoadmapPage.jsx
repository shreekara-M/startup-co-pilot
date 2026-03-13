import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Map,
  Sparkles,
  Milestone as MilestoneIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import MilestoneCard from "../components/roadmap/MilestoneCard";
import MilestoneForm from "../components/roadmap/MilestoneForm";
import { getIdea } from "../api/ideas.api";
import { getMilestones, generateRoadmap } from "../api/roadmap.api";

// ─── Roadmap Page ───────────────────────────────────────
//
// Route: /ideas/:id/roadmap
//
// Full roadmap view for a single startup idea.
// Milestones grouped by phase columns (MVP → V1 → V2 → Future).
// Each milestone card expands to show tasks with inline add/toggle/delete.

const phases = [
  { key: "mvp", label: "MVP", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { key: "v1", label: "Version 1", color: "bg-green-100 text-green-700", border: "border-green-200" },
  { key: "v2", label: "Version 2", color: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  { key: "future", label: "Future", color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
];

export default function RoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [generating, setGenerating] = useState(false);

  // ─── Fetch data ─────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [ideaData, milestonesData] = await Promise.all([
        getIdea(id),
        getMilestones(id),
      ]);
      setIdea(ideaData);
      setMilestones(milestonesData);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Idea not found");
        navigate("/ideas", { replace: true });
      } else {
        toast.error("Failed to load roadmap");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handlers ───────────────────────────────────────

  const handleMilestoneSaved = () => {
    fetchData();
  };

  const handleMilestoneDeleted = (deletedId) => {
    setMilestones((prev) => prev.filter((m) => m.id !== deletedId));
  };

  const handleTaskChanged = () => {
    fetchData();
  };

  const handleGenerate = async () => {
    // Warn if milestones already exist (AI adds on top, doesn't replace)
    if (milestones.length > 0) {
      const ok = confirm(
        `You already have ${milestones.length} milestone(s). AI will add new ones alongside them. Continue?`
      );
      if (!ok) return;
    }

    setGenerating(true);
    try {
      const data = await generateRoadmap(id);
      setMilestones(data);
      toast.success("AI roadmap generated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to generate roadmap. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Group milestones by phase
  const milestonesByPhase = phases.reduce((acc, phase) => {
    acc[phase.key] = milestones.filter((m) => m.phase === phase.key);
    return acc;
  }, {});

  const totalMilestones = milestones.length;

  // ─── Render ─────────────────────────────────────────

  if (loading) return <Loader />;
  if (!idea) return null;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/ideas/${id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700
                     transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {idea.title}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Map className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Roadmap</h1>
            </div>
            <p className="text-sm text-gray-500">
              {totalMilestones} {totalMilestones === 1 ? "milestone" : "milestones"} for{" "}
              <span className="font-medium text-gray-700">{idea.title}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating…" : "Generate with AI"}
            </Button>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Phase Columns ─── */}
      {totalMilestones > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {phases.map((phase) => {
            const phaseMilestones = milestonesByPhase[phase.key];
            return (
              <div key={phase.key} className="space-y-3">
                {/* Phase header */}
                <div className="flex items-center justify-between px-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.color}`}
                  >
                    {phase.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {phaseMilestones.length} {phaseMilestones.length === 1 ? "milestone" : "milestones"}
                  </span>
                </div>

                {/* Milestone cards */}
                {phaseMilestones.length > 0 ? (
                  phaseMilestones.map((ms) => (
                    <MilestoneCard
                      key={ms.id}
                      milestone={ms}
                      ideaId={id}
                      onEdit={(m) => setEditingMilestone(m)}
                      onDeleted={handleMilestoneDeleted}
                      onTaskChanged={handleTaskChanged}
                    />
                  ))
                ) : (
                  <div className={`border-2 border-dashed ${phase.border} rounded-xl p-6 text-center`}>
                    <MilestoneIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-2">
                      No milestones in {phase.label}
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      + Add one
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MilestoneIcon className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No milestones yet</h3>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            Break your startup plan into milestones. Add tasks to each milestone
            to track your progress toward launch.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating…" : "Generate with AI"}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create First Milestone
            </Button>
          </div>
        </div>
      )}

      {/* ─── Create Modal ─── */}
      <MilestoneForm
        ideaId={id}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaved={handleMilestoneSaved}
      />

      {/* ─── Edit Modal ─── */}
      <MilestoneForm
        ideaId={id}
        milestone={editingMilestone}
        isOpen={editingMilestone !== null}
        onClose={() => setEditingMilestone(null)}
        onSaved={handleMilestoneSaved}
      />
    </div>
  );
}
