import { Rocket } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Auth Layout ────────────────────────────────────────
//
// Centered card layout used by Login and Signup pages.
// Split design: left side = branding, right side = form.
// On mobile: single column (form only, branding on top).

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left Panel: Branding ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <Rocket className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Startup Co-Pilot</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Plan, track, and launch your startup idea. From first thought to
            MVP — your co-pilot for the journey.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <Rocket className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            Startup Co-Pilot
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
