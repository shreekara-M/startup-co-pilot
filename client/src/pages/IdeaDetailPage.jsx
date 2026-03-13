import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { LayoutDashboard, FileText, Map } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import IdeaHeader from "../components/ideas/IdeaHeader";
import IdeaOverview from "../components/ideas/IdeaOverview";
import IdeaEditModal from "../components/ideas/IdeaEditModal";
import DeleteConfirmModal from "../components/ideas/DeleteConfirmModal";
import DetailsForm from "../components/details/DetailsForm";
import RoadmapPreview from "../components/roadmap/RoadmapPreview";
import { getIdea } from "../api/ideas.api";

// ─── Idea Detail Page ───────────────────────────────────
//
// Route: /ideas/:id
//
// Tabbed layout:
//   1. Overview  → quick stats, pitch, details summary
//   2. Details   → 9-field startup details form (upsert)
//   3. Roadmap   → milestone preview (links to full roadmap)
//
// Also includes:
//   - Edit modal (title, pitch, status)
//   - Delete confirmation modal
//   - Tab persistence via URL search params (?tab=details)

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "details", label: "Details", icon: FileText },
  { key: "roadmap", label: "Roadmap", icon: Map },
];

export default function IdeaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Active tab from URL or default to "overview"
  const activeTab = searchParams.get("tab") || "overview";

  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };

  // ─── Fetch idea data ───────────────────────────────

  const fetchIdea = useCallback(async () => {
    try {
      const data = await getIdea(id);
      setIdea(data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Idea not found");
        navigate("/ideas", { replace: true });
      } else {
        toast.error("Failed to load idea");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  // ─── Handlers ──────────────────────────────────────

  const handleUpdated = (updatedIdea) => {
    // Merge updated fields into current idea (keep details intact)
    setIdea((prev) => ({ ...prev, ...updatedIdea }));
  };

  const handleDeleted = () => {
    navigate("/ideas", { replace: true });
  };

  const handleDetailsSaved = (savedDetails) => {
    // Update the idea's details in state
    setIdea((prev) => ({ ...prev, details: savedDetails }));
  };

  // ─── Render ────────────────────────────────────────

  if (loading) return <Loader />;
  if (!idea) return null;

  return (
    <div>
      {/* ─── Header: title, status, actions ─── */}
      <IdeaHeader
        idea={idea}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />

      {/* ─── Tab Navigation ─── */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium
                border-b-2 transition-colors duration-200 cursor-pointer
                ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === "overview" && <IdeaOverview idea={idea} />}

      {activeTab === "details" && (
        <DetailsForm
          ideaId={idea.id}
          existingDetails={idea.details}
          onSaved={handleDetailsSaved}
        />
      )}

      {activeTab === "roadmap" && <RoadmapPreview ideaId={idea.id} />}

      {/* ─── Modals ─── */}
      <IdeaEditModal
        idea={idea}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={handleUpdated}
      />

      <DeleteConfirmModal
        idea={idea}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
