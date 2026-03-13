import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import useAuth from "../../hooks/useAuth";

// ─── Top Navbar ─────────────────────────────────────────
//
// Sits at the top of the dashboard area.
// Shows:
//   Left:  mobile menu toggle + page title
//   Right: user name + avatar circle + logout button
//
// The sidebarCollapsed prop adjusts left margin to match sidebar width.

export default function Navbar({ onMenuToggle, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-white border-b border-gray-200
        flex items-center justify-between px-6 z-20
        transition-all duration-300
        ${sidebarCollapsed ? "left-[72px]" : "left-[240px]"}
      `}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button (visible on small screens) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side: user info + logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                     text-gray-600 hover:bg-gray-100 hover:text-gray-900
                     transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
