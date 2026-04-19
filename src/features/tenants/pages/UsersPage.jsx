import { toast } from "react-toastify";
import UsersFilters from "../components/UsersFilters";
import UsersHeader from "../components/UsersHeader";
import UsersStats from "../components/UsersStats";
import UsersTable from "../components/UsersTable";
import { useUsers } from "../hooks/useUsers";

export default function UsersPage() {
  const {
    filteredUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    stats,
    refetch,
  } = useUsers();

  const handleRefresh = async () => {
    await refetch();
    toast.success("Đã làm mới danh sách người dùng.");
  };

  return (
    <div className="space-y-5">
      <UsersHeader total={stats.total} loading={loading} onRefresh={handleRefresh} />

      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.3)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(217,95,75,0.08)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#D95F4B" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold flex-1" style={{ color: "#D95F4B" }}>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="text-xs font-semibold underline underline-offset-2 transition flex-shrink-0"
            style={{ color: "#D95F4B" }}
          >
            Thử lại
          </button>
        </div>
      )}

      <UsersStats stats={stats} />
      <UsersFilters searchTerm={searchTerm} onSearch={setSearchTerm} />
      <UsersTable users={filteredUsers} loading={loading} searchTerm={searchTerm} />
    </div>
  );
}
