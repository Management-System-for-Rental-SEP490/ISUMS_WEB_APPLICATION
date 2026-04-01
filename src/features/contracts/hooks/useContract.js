import { useMemo, useState, useCallback, useEffect } from "react";
import { getAllContracts } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";

const PAGE_SIZE = 20;

export function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortDir, setSortDir] = useState("DESC");

  const fetchContracts = useCallback(async (pageNum, dir) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllContracts({ page: pageNum - 1, size: PAGE_SIZE, sortBy: "createdAt", sortDir: dir });
      const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
      const mapped = arr.map(mapContractFromApi).filter(Boolean);
      setContracts(mapped);
      if (raw?.totalPages != null) setTotalPage(raw.totalPages);
      if (raw?.total != null) setTotalItems(raw.total);
    } catch (err) {
      const msg = err?.message ?? String(err);
      setError(msg);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts(page, sortDir);
  }, [page, sortDir, fetchContracts]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleToggleSortDir = useCallback(() => {
    setPage(1);
    setSortDir((prev) => (prev === "DESC" ? "ASC" : "DESC"));
  }, []);

  const filteredContracts = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    const statusNorm = filterStatus === "all" ? null : filterStatus.toLowerCase();
    return contracts.filter((c) => {
      const matchesSearch =
        !s ||
        (c.contractNumber ?? "").toLowerCase().includes(s) ||
        (c.tenant ?? "").toLowerCase().includes(s) ||
        (c.property ?? "").toLowerCase().includes(s) ||
        (c.name ?? "").toLowerCase().includes(s);
      const matchesFilter = !statusNorm || (c.status ?? "").toLowerCase() === statusNorm;
      return matchesSearch && matchesFilter;
    });
  }, [contracts, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => (c.status ?? "").toLowerCase() === "active").length;
    const pending = contracts.filter(
      (c) => (c.status ?? "").toLowerCase() === "pending" || (c.status ?? "").toLowerCase() === "draft",
    ).length;
    const totalRent = contracts.reduce((sum, c) => sum + (c.rent || 0), 0);
    return { total, active, pending, totalRent };
  }, [contracts]);

  const addContract = useCallback((payload) => {
    setContracts((prev) => [{ ...payload, id: Date.now() }, ...prev]);
  }, []);

  const removeContract = useCallback((id) => {
    setContracts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return {
    contracts,
    filteredContracts,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
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
    refetch: () => fetchContracts(page, sortDir),
    addContract,
    removeContract,
  };
}
