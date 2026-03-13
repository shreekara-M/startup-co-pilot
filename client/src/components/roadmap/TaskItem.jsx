import { useState } from "react";
import { Check, Circle, Clock, Trash2, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { updateTask, deleteTask } from "../../api/roadmap.api";

// ─── Task Item ──────────────────────────────────────────
//
// Single task row inside a MilestoneCard.
// Click the status icon to cycle: todo → in_progress → done.
// Click trash to delete (no confirm — tasks are lightweight).

const statusConfig = {
  todo: {
    icon: Circle,
    style: "text-gray-400 hover:text-blue-500",
    next: "in_progress",
  },
  in_progress: {
    icon: Clock,
    style: "text-blue-500 hover:text-green-500",
    next: "done",
  },
  done: {
    icon: Check,
    style: "text-green-500 hover:text-gray-400",
    next: "todo",
  },
};

const priorityColors = {
  low: "text-gray-400",
  medium: "text-amber-500",
  high: "text-red-500",
};

export default function TaskItem({ task, ideaId, milestoneId, onUpdated, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const config = statusConfig[task.status] || statusConfig.todo;
  const StatusIcon = config.icon;

  const handleToggleStatus = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await updateTask(ideaId, milestoneId, task.id, {
        status: config.next,
      });
      onUpdated(updated);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await deleteTask(ideaId, milestoneId, task.id);
      onDeleted(task.id);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50
                  transition-colors group ${task.status === "done" ? "opacity-60" : ""}`}
    >
      {/* Status toggle */}
      <button
        onClick={handleToggleStatus}
        disabled={busy}
        className={`shrink-0 cursor-pointer transition-colors ${config.style}`}
      >
        <StatusIcon className="h-4.5 w-4.5" />
      </button>

      {/* Title */}
      <span
        className={`flex-1 text-sm ${
          task.status === "done"
            ? "line-through text-gray-400"
            : "text-gray-700"
        }`}
      >
        {task.title}
      </span>

      {/* Priority flag */}
      <Flag className={`h-3.5 w-3.5 shrink-0 ${priorityColors[task.priority]}`} />

      {/* Delete (visible on hover) */}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100
                   transition-all cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
