// ─── Reusable Input ─────────────────────────────────────
//
// Works with React Hook Form via register() spread.
// Shows label above and error message below.
// Red border when there's a validation error.

export default function Input({
  label,
  type = "text",
  error,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-3.5 py-2.5 rounded-lg border text-sm
          transition-colors duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
