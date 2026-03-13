import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileDown, Download, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import PDFLayout from "../components/export/PDFLayout";
import { getIdea } from "../api/ideas.api";
import { getMilestones } from "../api/roadmap.api";
import { exportPDF } from "../utils/exportPDF";

// ─── Export Page ────────────────────────────────────────
//
// Route: /ideas/:id/export
//
// Preview startup plan + download as PDF + view export history.
// Uses html2canvas + jsPDF for client-side PDF generation.

export default function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const [idea, setIdea] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // ─── Fetch idea + milestones in parallel ────────────

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
        toast.error("Failed to load idea");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Download handler ───────────────────────────────

  const handleDownload = async () => {
    if (!pdfRef.current) return;

    setExporting(true);
    try {
      const filename = idea.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await exportPDF(pdfRef.current, filename || "startup-plan");
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────

  if (loading) return <Loader />;
  if (!idea) return null;

  const details = idea.details;
  const tasksDone = milestones.reduce(
    (sum, m) => sum + (m.tasks?.filter((t) => t.status === "done").length || 0),
    0
  );
  const tasksTotal = milestones.reduce(
    (sum, m) => sum + (m.tasks?.length || 0),
    0
  );

  return (
    <div>
      {/* ─── Hidden PDF Layout (captured by html2canvas) ─── */}
      <PDFLayout ref={pdfRef} idea={idea} milestones={milestones} />

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
              <FileDown className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Export</h1>
            </div>
            <p className="text-sm text-gray-500">
              Download your startup plan for{" "}
              <span className="font-medium text-gray-700">{idea.title}</span>
            </p>
          </div>

          <Button onClick={handleDownload} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Generating PDF…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* ─── Stats Bar ─── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
          <p className="text-xs text-gray-500">Milestones</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{tasksTotal}</p>
          <p className="text-xs text-gray-500">Tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* ─── Preview Card ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Plan Preview
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Title</p>
            <p className="text-sm font-medium text-gray-900">{idea.title}</p>
          </div>

          {idea.pitch && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Pitch</p>
              <p className="text-sm text-gray-700">{idea.pitch}</p>
            </div>
          )}

          {details ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {details.problem && (
                <PreviewField label="Problem" value={details.problem} />
              )}
              {details.solution && (
                <PreviewField label="Solution" value={details.solution} />
              )}
              {details.targetAudience && (
                <PreviewField label="Target Audience" value={details.targetAudience} />
              )}
              {details.uniqueValue && (
                <PreviewField label="Unique Value" value={details.uniqueValue} />
              )}
              {details.revenueModel && (
                <PreviewField label="Revenue Model" value={details.revenueModel} />
              )}
              {details.marketSize && (
                <PreviewField label="Market Size" value={details.marketSize} />
              )}
              {details.competitors?.length > 0 && (
                <PreviewField label="Competitors" value={details.competitors.join(", ")} />
              )}
              {details.teamNeeds?.length > 0 && (
                <PreviewField label="Team Needs" value={details.teamNeeds.join(", ")} />
              )}
              {details.budget != null && (
                <PreviewField label="Budget" value={`$${Number(details.budget).toLocaleString()}`} />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No details filled yet. Fill the details form first for a complete export.
            </p>
          )}
        </div>
      </div>

      {/* ─── Roadmap Summary ─── */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Roadmap ({milestones.length} milestones)
          </h2>
          <div className="space-y-3">
            {milestones.map((ms) => (
              <div key={ms.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ms.title}</p>
                  <p className="text-xs text-gray-500">
                    {ms.phase.toUpperCase()} &middot; {ms.tasks?.length || 0} tasks
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {ms.tasks?.filter((t) => t.status === "done").length || 0}/{ms.tasks?.length || 0} done
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Export History ─── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
        </div>
        <EmptyState
          icon={Clock}
          title="No exports yet"
          description="Your export history will appear here after you download your first PDF."
        />
      </div>
    </div>
  );
}

function PreviewField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
