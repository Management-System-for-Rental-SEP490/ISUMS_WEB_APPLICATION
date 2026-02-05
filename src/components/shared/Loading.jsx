import React from "react";

export function LoadingSpinner({
  size = "md", // "sm" | "md" | "lg"
  label = "Loading...", // text screen-reader + optional text
  showLabel = false, // hiển thị label bên cạnh spinner
  className = "",
}) {
  const px = size === "sm" ? 16 : size === "lg" ? 32 : 24;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className="animate-spin text-slate-600"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>

      <span className="sr-only">{label}</span>
      {showLabel && <span className="text-sm text-slate-600">{label}</span>}
    </div>
  );
}

export function FullPageLoading({ label = "Đang tải...", className = "" }) {
  return (
    <div className={`min-h-[60vh] w-full grid place-items-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" label={label} />
        <div className="text-sm text-slate-600">{label}</div>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  open,
  label = "Đang xử lý...",
  blur = true,
  className = "",
}) {
  if (!open) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] grid place-items-center",
        blur ? "backdrop-blur-sm" : "",
        "bg-black/25",
        className,
      ].join(" ")}
      aria-modal="true"
      role="dialog"
      aria-label={label}
    >
      <div className="rounded-2xl bg-white px-6 py-5 shadow-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" label={label} />
          <div className="text-sm font-medium text-slate-800">{label}</div>
        </div>
      </div>
    </div>
  );
}
