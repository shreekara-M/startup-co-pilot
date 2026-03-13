import { Loader2 } from "lucide-react";

// ─── Reusable Button ────────────────────────────────────
//
// Variants: primary (blue), secondary (gray), danger (red)
// Shows spinner when loading, disables interaction.

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2.5 rounded-lg text-sm font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
