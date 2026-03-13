import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import TaskItem from "./TaskItem";
import { createTask, deleteMilestone } from "../../api/roadmap.api";
import { formatDate } from "../../utils/formatDate";

// ─── Milestone Card ─────────────────────────────────────
//
// Expandable card showing a single milestone with nested tasks.
// Features:
//   - Expand/collapse task list
//   - Inline "Add Task" input
//   - Edit/Delete milestone actions
//   - Task status cycling and deletion

export default function MilestoneCard({
  milestone,
  ideaId,
  onEdit,
  onDeleted,
  onTaskChanged,
}) {
  const [expanded, setExpanded] = useState(true);
  const [taskTitle, setTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tasksDone = milestone.tasks?.filter((t) => t.status === "done").length || 0;
  const tasksTotal = milestone.tasks?.length || 0;

  // ─── Add Task ───────────────────────────────────────

  const handleAddTask = async () => {
    const title = taskTitle.trim();
    if (!title) return;

    setAddingTask(true);
    try {
      await createTask(ideaId, milestone.id, { title });
      setTaskTitle("");
      onTaskChanged();
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAddingTask(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  // ─── Delete Milestone ───────────────────────────────

  const handleDelete = async () => {
    if (!confirm(`Delete "${milestone.title}" and all its tasks?`)) return;
    setDeleting(true);
    try {
      await deleteMilestone(ideaId, milestone.id);
      toast.success("Milestone deleted");
      onDeleted(milestone.id);
    } catch {
      toast.error("Failed to delete milestone");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ─── Header ─── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand arrow */}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        )}

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {milestone.title}
          </p>
          {milestone.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {milestone.description}
            </p>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-2 shrink-0">
          {milestone.targetDate && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(milestone.targetDate)}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {tasksDone}/{tasksTotal}
          </span>
          <StatusBadge status={milestone.status} />
        </div>
      </div>

      {/* ─── Expanded Content ─── */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Task list */}
          {milestone.tasks?.length > 0 && (
            <div className="px-2 py-2 space-y-0.5">
              {milestone.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  ideaId={ideaId}
                  milestoneId={milestone.id}
                  onUpdated={() => onTaskChanged()}
                  onDeleted={() => onTaskChanged()}
                />
              ))}
            </div>
          )}

          {/* Add task inline input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task..."
              disabled={addingTask}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm
                         placeholder:text-gray-400 focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Button
              variant="secondary"
              onClick={handleAddTask}
              loading={addingTask}
              disabled={!taskTitle.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Milestone actions */}
          <div className="px-4 py-2.5 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(milestone); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs
                         text-gray-500 hover:bg-gray-100 hover:text-gray-700
                         transition-colors cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              disabled={deleting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs
                         text-red-500 hover:bg-red-50 hover:text-red-700
                         transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
