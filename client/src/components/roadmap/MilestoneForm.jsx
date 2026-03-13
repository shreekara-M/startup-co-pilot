import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  createMilestone,
  updateMilestone,
} from "../../api/roadmap.api";

// ─── Milestone Form Modal ───────────────────────────────
//
// Used for both create and edit.
// If `milestone` prop is passed → edit mode (pre-populates).
// If `milestone` is null → create mode.
//
// Fields: title, description, phase, targetDate
// On submit: calls API → onSaved callback → closes modal.

const phaseOptions = [
  { value: "mvp", label: "MVP" },
  { value: "v1", label: "Version 1" },
  { value: "v2", label: "Version 2" },
  { value: "future", label: "Future" },
];

export default function MilestoneForm({
  ideaId,
  milestone = null,
  isOpen,
  onClose,
  onSaved,
}) {
  const isEdit = milestone !== null;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Pre-populate for edit mode
  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        reset({
          title: milestone.title,
          description: milestone.description || "",
          phase: milestone.phase,
          targetDate: milestone.targetDate || "",
        });
      } else {
        reset({ title: "", description: "", phase: "mvp", targetDate: "" });
      }
    }
  }, [isOpen, milestone, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        phase: data.phase,
        targetDate: data.targetDate || undefined,
      };

      let saved;
      if (isEdit) {
        saved = await updateMilestone(ideaId, milestone.id, payload);
        toast.success("Milestone updated");
      } else {
        saved = await createMilestone(ideaId, payload);
        toast.success("Milestone created");
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} milestone`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Milestone" : "New Milestone"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Build landing page"
          error={errors.title?.message}
          {...register("title", {
            required: "Title is required",
            maxLength: { value: 200, message: "Max 200 characters" },
          })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What needs to happen in this milestone..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                       placeholder:text-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors duration-200"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phase selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phase
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                         bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 transition-colors duration-200 cursor-pointer"
              {...register("phase")}
            >
              {phaseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target date */}
          <Input
            label="Target Date"
            type="date"
            error={errors.targetDate?.message}
            {...register("targetDate")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="h-4 w-4" />
            {isEdit ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
