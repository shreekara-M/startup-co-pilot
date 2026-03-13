import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "./Loader";

// ─── Route Guard ────────────────────────────────────────
//
// Wraps protected routes. If not authenticated:
//   → Redirect to /login
//   → Save the intended URL so we can redirect back after login
//
// While checking token validity (loading), show spinner.

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
