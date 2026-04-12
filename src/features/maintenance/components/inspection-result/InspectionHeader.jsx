import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { STATUS_CONFIG } from "../../constants/inspection.constants";

const TYPE_CONFIG = {
  CHECK_IN:  { label: "Check-in",  color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  CHECK_OUT: { label: "Check-out", color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

export default function InspectionHeader({ inspection, id, onComplete }) {
  const navigate = useNavigate();
  const stCfg = STATUS_CONFIG[inspection?.status] ?? STATUS_CONFIG.CREATED;
  const tpCfg = inspection?.type ? (TYPE_CONFIG[inspection.type] ?? null) : null;
  const shortId = (id ?? inspection?.id ?? "").slice(0, 8).toUpperCase();

  return (
    <div className="space-y-3">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium transition"
        style={{ color: "#5A7A6E" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#3bb582")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#5A7A6E")}
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      {/* Header card */}
      <div
        className="rounded-2xl px-6 py-5"
        style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: icon + info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,181,130,0.10)" }}
            >
              <ClipboardCheck className="w-5 h-5" style={{ color: "#3bb582" }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold" style={{ color: "#1E2D28" }}>
                Kiểm tra{" "}
                <span className="font-mono text-base font-semibold" style={{ color: "#5A7A6E" }}>
                  #{shortId}
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {tpCfg && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: tpCfg.bg, color: tpCfg.color }}
                  >
                    {tpCfg.label}
                  </span>
                )}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: stCfg.bg, color: stCfg.color }}
                >
                  {stCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action */}
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
