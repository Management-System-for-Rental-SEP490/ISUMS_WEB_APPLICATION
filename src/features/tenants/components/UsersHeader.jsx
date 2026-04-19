import { Sparkles } from "lucide-react";

export default function UsersHeader({ total, onRefresh, loading }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>
            Khách thuê
          </span>
        </div>
        <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
          Quản lý Khách Thuê
        </h2>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {!loading && total > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582", border: "1px solid rgba(59,181,130,0.25)" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "#3bb582" }} />
            {total} người dùng
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition disabled:opacity-50"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
          onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
          onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
        >
          <svg className={["w-4 h-4", loading ? "animate-spin" : ""].join(" ")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#3bb582" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>
    </div>
  );
}
