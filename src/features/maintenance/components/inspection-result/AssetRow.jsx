import { useState } from "react";
import { Package, MoreVertical } from "lucide-react";
import ConditionBar from "./ConditionBar";
import { EVENT_TYPE_CONFIG, formatDateTime } from "../../constants/inspection.constants";

export default function AssetRow({ event }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const evCfg = EVENT_TYPE_CONFIG[event.eventType] ?? {
    label: event.eventType,
    color: "#5A7A6E",
    bg: "#EAF4F0",
  };

  return (
    <tr
      className="transition-colors group"
      style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FFFE")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td className="pl-5 pr-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#EAF4F0" }}
          >
            <Package className="w-4 h-4" style={{ color: "#3bb582" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>
              {event.assetName}
            </p>
            {event.assetCode && (
              <p className="text-[11px] font-mono" style={{ color: "#9CA3AF" }}>
                {event.assetCode}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="pr-4 py-4 w-28">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
          style={{ background: evCfg.bg, color: evCfg.color }}
        >
          {evCfg.label}
        </span>
      </td>

      <td className="pr-4 py-4 w-48">
        <ConditionBar prev={event.previousCondition} curr={event.currentCondition} />
      </td>

      <td className="pr-4 py-4">
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5A7A6E", maxWidth: 200 }}>
          {event.note || "—"}
        </p>
      </td>

      <td className="pr-4 py-4 w-36">
        <p className="text-xs" style={{ color: "#5A7A6E" }}>{formatDateTime(event.createdAt)}</p>
      </td>

      <td className="pr-4 py-4 w-10 relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          style={{ color: "#5A7A6E" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <>
            <button type="button" className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-6 top-8 z-20 rounded-xl py-1 w-36 shadow-lg"
              style={{ background: "#fff", border: "1px solid #C4DED5" }}
            >
              {["Xem chi tiết", "Xóa"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className="w-full text-left px-4 py-2 text-xs transition"
                  style={{ color: i === 1 ? "#D95F4B" : "#1E2D28" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = i === 1 ? "rgba(217,95,75,0.06)" : "#EAF4F0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </td>
    </tr>
  );
}
