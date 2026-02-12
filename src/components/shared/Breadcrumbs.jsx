import React from "react";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm text-gray-500 flex items-center gap-2">
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            {isLast || !it.onClick ? (
              <span className={isLast ? "text-gray-900 font-medium" : ""}>
                {it.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={it.onClick}
                className="hover:text-gray-900 transition"
              >
                {it.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
