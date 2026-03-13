import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// ─── App Layout ─────────────────────────────────────────
//
// Main dashboard shell used by all protected pages.
// Structure:
//   ┌──────────┬──────────────────────────┐
//   │          │        Navbar            │
//   │ Sidebar  ├──────────────────────────┤
//   │          │                          │
//   │          │     Page Content         │
//   │          │     (<Outlet />)         │
//   │          │                          │
//   └──────────┴──────────────────────────┘
//
// Sidebar is collapsible. Content area adjusts its left margin.

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Navbar */}
      <Navbar
        sidebarCollapsed={collapsed}
        onMenuToggle={() => setCollapsed(!collapsed)}
      />

      {/* Main content area */}
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300
          ${collapsed ? "ml-[72px]" : "ml-[240px]"}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
