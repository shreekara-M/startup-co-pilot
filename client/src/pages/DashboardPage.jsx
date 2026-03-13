import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  Milestone,
  CheckSquare,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Button from "../components/common/Button";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import { listIdeas } from "../api/ideas.api";
import { formatDate } from "../utils/formatDate";

// ─── Dashboard Page ─────────────────────────────────────
//
// Overview page with:
//   1. Welcome header
//   2. Stats cards (total ideas + breakdown by status)
//   3. Recent ideas table (last 5 updated)
//   4. Quick action button
//
// NOTE: Dashboard stats endpoint isn't implemented yet on the backend,
// so we derive stats from the ideas list for now.

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all ideas (up to 50) to derive stats
        const result = await listIdeas({ limit: 50 });
        setIdeas(result.ideas);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  // Derive stats from ideas
  const totalIdeas = ideas.length;
  const draftCount = ideas.filter((i) => i.status === "draft").length;
  const activeCount = ideas.filter((i) => i.status === "active").length;
  const archivedCount = ideas.filter((i) => i.status === "archived").length;
  const totalMilestones = ideas.reduce((sum, i) => sum + (i.milestoneCount || 0), 0);
  const recentIdeas = ideas.slice(0, 5);

  const stats = [
    {
      label: "Total Ideas",
      value: totalIdeas,
      icon: Lightbulb,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active",
      value: activeCount,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: CheckSquare,
      color: "bg-gray-50 text-gray-600",
    },
    {
      label: "Milestones",
      value: totalMilestones,
      icon: Milestone,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div>
      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with your startups
          </p>
        </div>
        <Button onClick={() => navigate("/ideas")}>
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Recent Ideas ─── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Ideas</h2>
          <button
            onClick={() => navigate("/ideas")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700
                       font-medium transition-colors cursor-pointer"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {recentIdeas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Lightbulb className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              No ideas yet. Create your first one!
            </p>
            <Button onClick={() => navigate("/ideas")}>Get Started</Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => navigate(`/ideas/${idea.id}`)}
                className="flex items-center justify-between px-6 py-4
                           hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {idea.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {idea.pitch || "No pitch"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <StatusBadge status={idea.status} />
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {formatDate(idea.updatedAt)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
