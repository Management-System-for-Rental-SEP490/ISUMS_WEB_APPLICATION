import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { STATUS_CONFIG } from "../../constants/inspection.constants";

export default function InspectionHeader({ inspection, id, onComplete }) {
  const navigate = useNavigate();
  const stCfg = STATUS_CONFIG[inspection?.status] ?? STATUS_CONFIG.CREATED;
  const shortId = (id ?? inspection?.id ?? "").slice(0, 8).toUpperCase();

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition flex-shrink-0"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold" style={{ color: "#1E2D28" }}>Kiểm tra định kỳ</h2>
              <span className="text-sm font-mono font-semibold" style={{ color: "#5A7A6E" }}>#{shortId}</span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide"
                style={{ background: stCfg.bg, color: stCfg.color }}
              >
                {stCfg.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold rounded-xl transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "#ffffff"; }}
          >
            Check-in
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition shadow-sm"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
