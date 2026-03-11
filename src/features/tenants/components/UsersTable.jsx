import { LoadingSpinner } from "../../../components/shared/Loading";

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials || "?"}
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">
        {hasSearch ? "Không tìm thấy người dùng phù hợp" : "Chưa có người dùng nào"}
      </p>
      <p className="text-sm text-slate-400">
        {hasSearch ? "Thử thay đổi từ khóa tìm kiếm" : "Dữ liệu sẽ hiển thị tại đây"}
      </p>
    </div>
  );
}

export default function UsersTable({ users, loading, searchTerm }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-16 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" showLabel label="Đang tải danh sách người dùng..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {users.length === 0 ? (
        <EmptyState hasSearch={!!searchTerm} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Người dùng</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Số điện thoại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.displayName} />
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{user.displayName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-700 hover:underline transition">
                      {user.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.phone === "Chưa có" ? (
                      <span className="text-xs text-slate-400 italic">Chưa có</span>
                    ) : (
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {user.phone}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
