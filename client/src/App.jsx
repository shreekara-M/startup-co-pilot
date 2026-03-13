import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import IdeasPage from "./pages/IdeasPage";
import IdeaDetailPage from "./pages/IdeaDetailPage";
import RoadmapPage from "./pages/RoadmapPage";
import ExportPage from "./pages/ExportPage";

// ─── App: Root Component ────────────────────────────────
//
// Route structure:
//   Public:    /login, /signup
//   Protected: AppLayout wraps all dashboard pages
//     /dashboard         → stats overview
//     /ideas             → ideas list + create modal
//     /ideas/:id         → idea detail (overview, details, roadmap tabs)
//     /ideas/:id/roadmap → full roadmap builder (milestones + tasks)
//     /ideas/:id/export  → export preview + PDF download
//   Fallback:  / → /dashboard

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ─── Public Routes ─── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ─── Protected Routes (inside AppLayout) ─── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/ideas/:id" element={<IdeaDetailPage />} />
            <Route path="/ideas/:id/roadmap" element={<RoadmapPage />} />
            <Route path="/ideas/:id/export" element={<ExportPage />} />
          </Route>

          {/* ─── Fallback ─── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
