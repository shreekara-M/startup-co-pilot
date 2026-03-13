import { useState, useEffect, useCallback } from "react";
import { Plus, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import IdeaCard from "../components/ideas/IdeaCard";
import IdeaForm from "../components/ideas/IdeaForm";
import IdeaStatusFilter from "../components/ideas/IdeaStatusFilter";
import { listIdeas } from "../api/ideas.api";

// ─── Ideas Page ─────────────────────────────────────────
//
// List all user's startup ideas with:
//   - Status filter tabs (All / Draft / Active / Archived)
//   - Responsive grid of IdeaCards
//   - Pagination (prev/next)
//   - "New Idea" button → opens create modal
//   - Empty state when no ideas exist

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const LIMIT = 9; // 3x3 grid

  // Fetch ideas from API
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filter) params.status = filter;

      const result = await listIdeas(params);
      setIdeas(result.ideas);
      setPagination(result.pagination);
    } catch (err) {
      toast.error("Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  // After creating a new idea, refresh the list
  const handleIdeaCreated = () => {
    setFilter(null);
    setPage(1);
    fetchIdeas();
  };

  if (loading && ideas.length === 0) {
    return <Loader />;
  }

  return (
    <div>
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total || 0} startup {pagination.total === 1 ? "idea" : "ideas"} total
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* ─── Filters ─── */}
      <div className="mb-6">
        <IdeaStatusFilter activeFilter={filter} onChange={handleFilterChange} />
      </div>

      {/* ─── Ideas Grid ─── */}
      {ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={filter ? "No ideas match this filter" : "No ideas yet"}
          description={
            filter
              ? `You don't have any ${filter} ideas. Try a different filter.`
              : "Create your first startup idea to get started."
          }
          actionLabel={filter ? undefined : "Create First Idea"}
          onAction={filter ? undefined : () => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>

          {/* ─── Pagination ─── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Create Idea Modal ─── */}
      <IdeaForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleIdeaCreated}
      />
    </div>
  );
}
