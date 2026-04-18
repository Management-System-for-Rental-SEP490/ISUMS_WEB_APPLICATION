import { UserCheck } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const B = {
  green: "#3bb582", blue: "#2096d8", card: "#FAFFFE",
  muted: "#EAF4F0", border: "#C4DED5", fg: "#1E2D28", mutedFg: "#5A7A6E",
  blueMuted: "rgba(32, 150, 216, 0.12)",
};

export default function IssueListPanel({ issues, loading, selected, onSelect }) {
  return (
    <div
      className="w-72 flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ background: B.card, border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)" }}
    >
      <div className="px-4 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(196,222,213,0.6)` }}>
        <p className="text-sm font-bold font-heading" style={{ color: B.fg }}>Yêu cầu sửa chữa</p>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: B.muted, color: B.green }}>
          {issues.length}
        </span>
      </div>

      <div>
        {loading && [1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3.5 space-y-2 animate-pulse" style={{ borderBottom: `1px solid rgba(196,222,213,0.3)` }}>
            <div className="h-3 rounded-lg w-1/3" style={{ background: B.muted }} />
            <div className="h-4 rounded-lg w-3/4" style={{ background: "#EAF4F0" }} />
            <div className="h-3 rounded-lg w-1/2" style={{ background: "#EAF4F0" }} />
          </div>
        ))}

        {!loading && issues.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: B.mutedFg }}>Không có yêu cầu nào</div>
        )}

        {!loading && issues.map((issue) => {
          const isActive = selected?.id === issue.id;
          return (
            <button
              key={issue.id}
              onClick={() => onSelect(issue)}
              className="w-full text-left px-4 py-3.5 transition-all duration-200"
              style={{
                borderBottom: `1px solid rgba(196,222,213,0.3)`,
                background: isActive ? "rgba(59,181,130,0.08)" : "transparent",
                borderLeft: isActive ? "3px solid #3bb582" : "3px solid transparent",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = B.muted; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg" style={{ background: B.blueMuted, color: B.blue }}>
                  #{String(issue.id).slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[10px]" style={{ color: B.mutedFg }}>{dayjs(issue.createdAt).fromNow()}</span>
              </div>
              <p className="text-sm font-semibold leading-snug truncate" style={{ color: B.fg }}>{issue.title}</p>
              <p className="text-[11px] mt-1 flex items-center gap-1">
                {issue.assignedStaffId ? (
                  <span className="font-medium flex items-center gap-1" style={{ color: B.blue }}>
                    <UserCheck className="w-3 h-3" />{issue.staffName ?? "Đã phân công"}
                  </span>
                ) : (
                  <span className="font-medium" style={{ color: "#D95F4B" }}>● Chưa phân công</span>
                )}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
