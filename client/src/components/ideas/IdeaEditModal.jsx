import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { updateIdea } from "../../api/ideas.api";

// ─── Edit Idea Modal ────────────────────────────────────
//
// Edit title, pitch, and status of an existing idea.
// Pre-populates form with current values.

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export default function IdeaEditModal({ idea, isOpen, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Pre-populate when idea changes or modal opens
  useEffect(() => {
    if (idea && isOpen) {
      reset({
        title: idea.title,
        pitch: idea.pitch || "",
        status: idea.status,
      });
    }
  }, [idea, isOpen, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updated = await updateIdea(idea.id, {
        title: data.title.trim(),
        pitch: data.pitch?.trim() || undefined,
        status: data.status,
      });

      toast.success("Idea updated!");
      onUpdated(updated);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update idea";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Idea">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title", {
            required: "Title is required",
            maxLength: { value: 200, message: "Max 200 characters" },
          })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Elevator Pitch
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Describe your idea in a sentence or two..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                       placeholder:text-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors duration-200"
            {...register("pitch", {
              maxLength: { value: 1000, message: "Max 1000 characters" },
            })}
          />
          {errors.pitch && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.pitch.message}
            </p>
          )}
        </div>

        {/* Status selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition-colors duration-200 cursor-pointer"
            {...register("status")}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
