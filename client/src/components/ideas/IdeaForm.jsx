import { useState } from "react";
import { useForm } from "react-hook-form";
import { Lightbulb } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { createIdea } from "../../api/ideas.api";

// ─── Create Idea Modal ──────────────────────────────────
//
// Simple form: title (required) + pitch (optional).
// On success: calls onCreated callback to refresh the list.

export default function IdeaForm({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const idea = await createIdea({
        title: data.title.trim(),
        pitch: data.pitch?.trim() || undefined,
      });

      toast.success("Idea created!");
      reset();
      onCreated(idea);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create idea";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Startup Idea">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Icon header */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-700">
            Give your idea a name. You can add details later.
          </p>
        </div>

        <Input
          label="Title"
          placeholder="e.g. PetTrack — Smart Pet Health App"
          error={errors.title?.message}
          {...register("title", {
            required: "Title is required",
            minLength: { value: 1, message: "Title is required" },
            maxLength: { value: 200, message: "Title must be under 200 characters" },
          })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Elevator Pitch
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>
          <textarea
            placeholder="Describe your idea in one or two sentences..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                       placeholder:text-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors duration-200"
            {...register("pitch", {
              maxLength: { value: 1000, message: "Pitch must be under 1000 characters" },
            })}
          />
          {errors.pitch && (
            <p className="mt-1.5 text-sm text-red-600">{errors.pitch.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Idea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
