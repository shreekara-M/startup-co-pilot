import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { deleteIdea } from "../../api/ideas.api";

// ─── Delete Confirmation Modal ──────────────────────────
//
// Shows warning with idea title.
// On confirm: DELETE /ideas/:id → redirect to /ideas.

export default function DeleteConfirmModal({
  idea,
  isOpen,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteIdea(idea.id);
      toast.success("Idea deleted");
      onDeleted();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to delete idea";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Idea">
      <div className="text-center py-2">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h4 className="text-base font-semibold text-gray-900 mb-2">
          Are you sure?
        </h4>
        <p className="text-sm text-gray-500 mb-1">
          This will permanently delete{" "}
          <span className="font-medium text-gray-700">"{idea?.title}"</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          All details, milestones, tasks, and export history will be removed.
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}
