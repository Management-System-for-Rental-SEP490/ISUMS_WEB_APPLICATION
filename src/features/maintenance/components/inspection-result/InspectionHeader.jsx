import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { STATUS_CONFIG, STATUS_STEPS } from "../../constants/inspection.constants";

const TYPE_CONFIG = {
  CHECK_IN:  { label: "Check-in",  color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  CHECK_OUT: { label: "Check-out", color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

// ── Status Progress Bar ───────────────────────────────────────────────────────
function StatusProgressBar({ status }) {
  const isCancelled  = status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(196,222,213,0.5)" }}>
      {isCancelled ? (
        // Cancelled — special red banner
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.2)" }}
        >
          <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D95F4B" }} />
          <span className="text-xs font-semibold" style={{ color: "#D95F4B" }}>
            Lịch kiểm tra này đã bị hủy
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, i) => {
            const cfg      = STATUS_CONFIG[step];
            const isDone   = i < currentIndex;
            const isActive = i === currentIndex;
            const isLast   = i === STATUS_STEPS.length - 1;

            const dotColor = isDone || isActive ? cfg.color : "#D1D5DB";
            const lineColor = isDone ? "#3bb582" : "#E5E7EB";

            return (
              <div key={step} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : 1 }}>
                {/* Step */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isDone || isActive ? dotColor : "#F3F4F6",
                      border: `2px solid ${dotColor}`,
                    }}
                  >
                    {isDone ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full" style={{ background: "#fff" }} />
                    ) : null}
                  </div>
                  <span
                    className="text-[10px] font-semibold whitespace-nowrap"
                    style={{ color: isActive ? cfg.color : isDone ? "#5A7A6E" : "#9CA3AF" }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className="flex-1 h-0.5 mx-1 mb-4 transition-all duration-300"
                    style={{ background: lineColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── InspectionHeader ──────────────────────────────────────────────────────────
export default function InspectionHeader({ inspection, id, onComplete }) {
  const navigate = useNavigate();
  const stCfg  = STATUS_CONFIG[inspection?.status] ?? STATUS_CONFIG.CREATED;
  const tpCfg  = inspection?.type ? (TYPE_CONFIG[inspection.type] ?? null) : null;
  const shortId = (id ?? inspection?.id ?? "").slice(0, 8).toUpperCase();

  const isDone      = inspection?.status === "DONE";
  const isApproved  = inspection?.status === "APPROVED";
  const isCancelled = inspection?.status === "CANCELLED";
  const showApprove = !isApproved && !isCancelled;

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
          {showApprove && (
            <button
              type="button"
              onClick={onComplete}
              disabled={!isDone}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              title={!isDone ? "Chỉ có thể xác nhận khi trạng thái là Hoàn thành" : ""}
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận
            </button>
          )}
        </div>

        {/* Progress bar */}
        <StatusProgressBar status={inspection?.status ?? "CREATED"} />
      </div>
    </div>
  );
}
