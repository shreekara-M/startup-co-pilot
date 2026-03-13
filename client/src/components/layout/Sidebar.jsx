import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Lightbulb,
  Map,
  Rocket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Sidebar ────────────────────────────────────────────
//
// Left navigation panel.
// Collapsible: full width (icons + labels) or icon-only.
// NavLink uses "active" class for current route highlighting.
// On mobile: hidden by default, toggled via AppLayout.

// ─── Nav Items ──────────────────────────────────────────
//
// `end` controls NavLink matching:
//   end: true  → only highlights on exact match (Dashboard)
//   end: false → highlights on prefix match (Ideas → also /ideas/:id, /ideas/:id/roadmap)

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/ideas", icon: Lightbulb, label: "My Ideas", end: false },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200
        flex flex-col z-30 transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-[240px]"}
      `}
    >
      {/* ─── Logo ─── */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-200">
        <Rocket className="h-7 w-7 text-blue-600 shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
            Co-Pilot
          </span>
        )}
      </div>

      {/* ─── Nav Links ─── */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ─── Collapse Toggle ─── */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700
                     transition-colors duration-200 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
