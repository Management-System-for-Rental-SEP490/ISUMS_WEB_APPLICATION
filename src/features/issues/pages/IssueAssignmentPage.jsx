import { useState } from "react";
import { UserCheck } from "lucide-react";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";

// TODO: thay bằng data thật từ API khi có hook
const issues = [];
const staff  = [];

export default function IssueAssignmentPage() {
  const [assignments, setAssignments] = useState({});
  const [assigned, setAssigned]       = useState(new Set());

  const handleAssign = (issueId) => {
    const staffId = assignments[issueId];
    if (!staffId) return;
    setAssigned((prev) => new Set([...prev, issueId]));
  };

  const pendingList = issues.filter((i) => !assigned.has(i.id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phân công xử lý</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pendingList.length} yêu cầu chưa có người nhận</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border rounded-lg px-4 py-2 shadow-sm">
          <UserCheck className="w-4 h-4 text-teal-600" />
          {staff.filter((s) => s.available).length} nhân viên đang sẵn sàng
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Issues list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Yêu cầu chờ phân công ({pendingList.length})
          </h3>

          {pendingList.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center text-gray-400 text-sm">
              Không có yêu cầu nào chờ phân công
            </div>
          )}

          {pendingList.map((issue) => {
            const status = ISSUE_STATUS_CONFIG[issue.status] ?? ISSUE_STATUS_CONFIG.CREATED;
            return (
              <div key={issue.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4">
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{issue.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{issue.description}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.pill}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={assignments[issue.id] ?? ""}
                    onChange={(e) => setAssignments((prev) => ({ ...prev, [issue.id]: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staff.filter((s) => s.available).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.load} việc)</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(issue.id)}
                    disabled={!assignments[issue.id]}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 disabled:cursor-not-allowed text-white text-sm rounded-lg transition font-medium"
                  >
                    Giao
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff panel */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Nhân viên</h3>

          {staff.length === 0 && (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400 text-sm">
              Chưa có dữ liệu nhân viên
            </div>
          )}

          <div className="space-y-3">
            {staff.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    s.available ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}>
                    {s.available ? "Sẵn sàng" : "Bận"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{s.role}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min((s.load / 6) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{s.load}/6 việc</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
