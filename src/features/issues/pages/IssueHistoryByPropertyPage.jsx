import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ISSUE_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "../constants/issue.constants";

// TODO: thay bằng data thật từ API khi có hook
// Cấu trúc mỗi property: { id, name, address, issues: Issue[] }
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
        <h2 className="text-2xl font-bold text-gray-900">Lịch sử theo BĐS</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tổng quan sự cố theo từng bất động sản để hỗ trợ quyết định bảo trì chủ động
        </p>
      </div>

      {/* Summary cards */}
      {propertiesWithIssues.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {propertiesWithIssues.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="bg-white rounded-xl border shadow-sm p-4 text-left hover:border-teal-300 transition"
            >
              <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{p.issues.length}</p>
              <p className="text-xs text-gray-400">sự cố</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail per property */}
      {propertiesWithIssues.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center text-gray-400 text-sm">
          Không có dữ liệu lịch sử sự cố
        </div>
      ) : (
        <div className="space-y-3">
          {propertiesWithIssues.map((p) => {
            const isOpen = expanded.has(p.id);
            return (
              <div key={p.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {/* Property header */}
                <button
                  onClick={() => toggle(p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    {isOpen
                      ? <ChevronDown  className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                    <div>
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.address}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{p.issues.length} sự cố</span>
                </button>

                {/* Issue rows */}
                {isOpen && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                          <th className="px-5 py-2.5 font-semibold">Tiêu đề</th>
                          <th className="px-4 py-2.5 font-semibold">Loại</th>
                          <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                          <th className="px-4 py-2.5 font-semibold">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {p.issues.map((issue) => {
                          const type   = ISSUE_TYPE_CONFIG[issue.type]     ?? ISSUE_TYPE_CONFIG.REPAIR;
                          const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
                          return (
                            <tr key={issue.id} className="hover:bg-gray-50 transition">
                              <td className="px-5 py-3">
                                <p className="font-medium text-gray-800">{issue.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{issue.description}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${type.cls}`}>
                                  {type.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.pill}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500">{issue.createdAt}</td>
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
