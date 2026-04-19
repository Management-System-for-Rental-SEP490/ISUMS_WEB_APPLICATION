import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ISSUE_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "../constants/issue.constants";

const propertiesWithIssues = [];

export default function IssueHistoryByPropertyPage() {
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
<h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Lịch sử theo BĐS</h2>
      </div>

      {/* Summary cards */}
      {propertiesWithIssues.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {propertiesWithIssues.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="rounded-2xl p-4 text-left transition-all duration-200"
              style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.background = "#F0FAF6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.background = "#FFFFFF"; }}
            >
              <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>{p.name}</p>
              <p className="text-2xl font-heading font-bold mt-1" style={{ color: "#3bb582" }}>{p.issues.length}</p>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>sự cố</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail per property */}
      {propertiesWithIssues.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center text-sm"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5", color: "#5A7A6E" }}
        >
          Không có dữ liệu lịch sử sự cố
        </div>
      ) : (
        <div className="space-y-3">
          {propertiesWithIssues.map((p) => {
            const isOpen = expanded.has(p.id);
            return (
              <div
                key={p.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
              >
                <button
                  onClick={() => toggle(p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 transition"
                  onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div className="flex items-center gap-3 text-left">
                    {isOpen
                      ? <ChevronDown  className="w-4 h-4 flex-shrink-0" style={{ color: "#3bb582" }} />
                      : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#5A7A6E" }} />
                    }
                    <div>
                      <p className="font-semibold" style={{ color: "#1E2D28" }}>{p.name}</p>
                      <p className="text-xs" style={{ color: "#5A7A6E" }}>{p.address}</p>
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: "#5A7A6E" }}>{p.issues.length} sự cố</span>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto" style={{ borderTop: "1px solid #C4DED5" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide" style={{ background: "#EAF4F0", color: "#5A7A6E" }}>
                          <th className="px-5 py-2.5 font-semibold">Tiêu đề</th>
                          <th className="px-4 py-2.5 font-semibold">Loại</th>
                          <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                          <th className="px-4 py-2.5 font-semibold">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.issues.map((issue) => {
                          const type   = ISSUE_TYPE_CONFIG[issue.type]     ?? ISSUE_TYPE_CONFIG.REPAIR;
                          const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
                          return (
                            <tr
                              key={issue.id}
                              className="transition"
                              style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <td className="px-5 py-3">
                                <p className="font-medium" style={{ color: "#1E2D28" }}>{issue.title}</p>
                                <p className="text-xs mt-0.5 truncate" style={{ color: "#5A7A6E" }}>{issue.description}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: type.bg, color: type.color }}>
                                  {type.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-3" style={{ color: "#5A7A6E" }}>{issue.createdAt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
