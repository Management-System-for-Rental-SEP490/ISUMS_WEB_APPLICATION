import React from "react";

const BASE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold";

export default function StatusBadge({ label, className = "", icon: Icon }) {
  return (
    <span className={`${BASE_CLASS} ${className}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}
