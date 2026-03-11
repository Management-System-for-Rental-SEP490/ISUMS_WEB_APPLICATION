import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../api/users.api";
import { mapUserFromApi } from "../utils/mapUserFromApi";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllUsers();
      const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setUsers(arr.map(mapUserFromApi).filter(Boolean));
    } catch (err) {
      setError(err?.message ?? "Không thể tải danh sách người dùng.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredUsers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.phone.toLowerCase().includes(s)
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => ({
    total: users.length,
    filtered: filteredUsers.length,
  }), [users.length, filteredUsers.length]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    stats,
    refetch,
  };
}
