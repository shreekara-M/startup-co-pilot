import { forwardRef } from "react";

// ─── PDF Layout ──────────────────────────────────────────
//
// Print-optimized layout rendered off-screen.
// html2canvas captures this element to generate the PDF.
//
// Accepts: idea (with details) + milestones array
// Uses inline styles so Tailwind classes render correctly
// when the element is positioned off-screen.

const phases = [
  { key: "mvp", label: "MVP", bg: "#dbeafe", text: "#1d4ed8" },
  { key: "v1", label: "Version 1", bg: "#dcfce7", text: "#15803d" },
  { key: "v2", label: "Version 2", bg: "#f3e8ff", text: "#7e22ce" },
  { key: "future", label: "Future", bg: "#fef3c7", text: "#b45309" },
];

const priorityColors = {
  high: { bg: "#fee2e2", text: "#dc2626" },
  medium: { bg: "#fef3c7", text: "#d97706" },
  low: { bg: "#dcfce7", text: "#16a34a" },
};

const PDFLayout = forwardRef(function PDFLayout({ idea, milestones = [] }, ref) {
  const details = idea.details;

  // Group milestones by phase
  const milestonesByPhase = phases.reduce((acc, phase) => {
    acc[phase.key] = milestones.filter((m) => m.phase === phase.key);
    return acc;
  }, {});

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "800px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#ffffff",
        color: "#111827",
        padding: "48px",
      }}
    >
      {/* ─── Header ─── */}
      <div style={{ marginBottom: "32px", borderBottom: "2px solid #2563eb", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
          {idea.title}
        </h1>
        {idea.pitch && (
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0", lineHeight: "1.6" }}>
            {idea.pitch}
          </p>
        )}
        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            Status: <strong style={{ color: "#374151" }}>{idea.status}</strong>
          </span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            Milestones: <strong style={{ color: "#374151" }}>{milestones.length}</strong>
          </span>
        </div>
      </div>

      {/* ─── Startup Details ─── */}
      {details && (
        <div style={{ marginBottom: "32px" }}>
          <SectionTitle>Startup Details</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {details.problem && <DetailField label="Problem" value={details.problem} />}
            {details.solution && <DetailField label="Solution" value={details.solution} />}
            {details.targetAudience && <DetailField label="Target Audience" value={details.targetAudience} />}
            {details.uniqueValue && <DetailField label="Unique Value Proposition" value={details.uniqueValue} />}
            {details.revenueModel && <DetailField label="Revenue Model" value={details.revenueModel} />}
            {details.marketSize && <DetailField label="Market Size" value={details.marketSize} />}
          </div>

          {/* Array fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
            {details.competitors?.length > 0 && (
              <DetailField label="Competitors" value={details.competitors.join(", ")} />
            )}
            {details.teamNeeds?.length > 0 && (
              <DetailField label="Team Needs" value={details.teamNeeds.join(", ")} />
            )}
            {details.budget != null && (
              <DetailField label="Budget" value={`$${Number(details.budget).toLocaleString()}`} />
            )}
          </div>
        </div>
      )}

      {/* ─── Roadmap ─── */}
      {milestones.length > 0 && (
        <div>
          <SectionTitle>Roadmap</SectionTitle>

          {phases.map((phase) => {
            const phaseMilestones = milestonesByPhase[phase.key];
            if (phaseMilestones.length === 0) return null;

            return (
              <div key={phase.key} style={{ marginBottom: "24px" }}>
                {/* Phase badge */}
                <div style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "12px",
                  backgroundColor: phase.bg,
                  color: phase.text,
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}>
                  {phase.label} ({phaseMilestones.length})
                </div>

                {/* Milestone cards */}
                {phaseMilestones.map((ms) => (
                  <div
                    key={ms.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      marginBottom: "10px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      {ms.title}
                    </div>
                    {ms.description && (
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                        {ms.description}
                      </div>
                    )}

                    {/* Tasks */}
                    {ms.tasks?.length > 0 && (
                      <div style={{ paddingLeft: "8px", borderLeft: "2px solid #e5e7eb" }}>
                        {ms.tasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "4px 0",
                              fontSize: "12px",
                            }}
                          >
                            <span style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "3px",
                              border: task.status === "done" ? "none" : "1.5px solid #d1d5db",
                              backgroundColor: task.status === "done" ? "#2563eb" : "transparent",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: "9px",
                              flexShrink: 0,
                            }}>
                              {task.status === "done" && "✓"}
                            </span>
                            <span style={{
                              color: task.status === "done" ? "#9ca3af" : "#374151",
                              textDecoration: task.status === "done" ? "line-through" : "none",
                              flex: 1,
                            }}>
                              {task.title}
                            </span>
                            {task.priority && (
                              <span style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                backgroundColor: (priorityColors[task.priority] || priorityColors.medium).bg,
                                color: (priorityColors[task.priority] || priorityColors.medium).text,
                                fontWeight: "500",
                              }}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Footer ─── */}
      <div style={{
        marginTop: "40px",
        paddingTop: "16px",
        borderTop: "1px solid #e5e7eb",
        fontSize: "10px",
        color: "#9ca3af",
        textAlign: "center",
      }}>
        Generated by Startup Co-Pilot &middot; {new Date().toLocaleDateString()}
      </div>
    </div>
  );
});

// ─── Sub-components ────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: "18px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "16px",
      paddingBottom: "8px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      {children}
    </h2>
  );
}

function DetailField({ label, value }) {
  return (
    <div style={{ padding: "10px 12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
      <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
        {value}
      </div>
    </div>
  );
}

export default PDFLayout;
