import { useMemo, useState, useCallback, useEffect } from "react";
import { getAllContracts } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";

const PAGE_SIZE = 15;

export function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortDir, setSortDir] = useState("DESC");
  const [statusCounts, setStatusCounts] = useState({ active: 0, pending: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContracts = useCallback(async (pageNum, dir, keyword, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        size: PAGE_SIZE,
        sorts: `createdAt:${dir}`,
      };
      if (keyword?.trim()) params.keyword = keyword.trim();
      if (status && status !== "all") params.status = status;

      const raw = await getAllContracts(params);
      const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
      const mapped = arr.map(mapContractFromApi).filter(Boolean);
      setContracts(mapped);
      if (raw?.totalPages != null) setTotalPage(raw.totalPages);
      if (raw?.total != null) setTotalItems(raw.total);
      else if (raw?.totalElements != null) setTotalItems(raw.totalElements);
    } catch (err) {
      const httpStatus = err?.response?.status;
      const msg =
        httpStatus === 404
          ? "Không tìm thấy danh sách hợp đồng."
          : httpStatus === 403
            ? "Bạn không có quyền xem danh sách hợp đồng."
            : "Không thể tải danh sách hợp đồng, vui lòng thử lại.";
      setError(msg);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts(page, sortDir, debouncedSearch, filterStatus);
  }, [page, sortDir, debouncedSearch, filterStatus, fetchContracts]);

  const handleSetSearchTerm = useCallback((term) => {
    setPage(1);
    setSearchTerm(term);
  }, []);

  const handleSetFilterStatus = useCallback((status) => {
    setPage(1);
    setFilterStatus(status);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleToggleSortDir = useCallback(() => {
    setPage(1);
    setSortDir((prev) => (prev === "DESC" ? "ASC" : "DESC"));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getAllContracts({ status: "IN_PROGRESS", size: 1 }),
        getAllContracts({ status: "PENDING_TENANT_REVIEW", size: 1 }),
      ]);
      setStatusCounts({
        active: activeRes?.total ?? 0,
        pending: pendingRes?.total ?? 0,
      });
    } catch {
      // non-critical — giữ nguyên 0 nếu lỗi
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = useMemo(() => ({
    total: totalItems,
    active: statusCounts.active,
    pending: statusCounts.pending,
    totalRent: contracts.reduce((sum, c) => sum + (c.rent || 0), 0),
  }), [totalItems, statusCounts, contracts]);

  const addContract = useCallback((payload) => {
    setContracts((prev) => [{ ...payload, id: Date.now() }, ...prev]);
  }, []);

  const removeContract = useCallback((id) => {
    setContracts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return {
    contracts,
    filteredContracts: contracts,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    filterStatus,
    setFilterStatus: handleSetFilterStatus,
    sortDir,
    onToggleSortDir: handleToggleSortDir,
    page,
    totalPage,
    totalItems,
    pageSize: PAGE_SIZE,
    onPageChange: handlePageChange,
    stats,
    loading,
    error,
    refetch: () => fetchContracts(page, sortDir, debouncedSearch, filterStatus),
    addContract,
    removeContract,
  };
}
