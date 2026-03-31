import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllContracts } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";

export function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllContracts();
      const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const mapped = arr.map(mapContractFromApi);
      setContracts(mapped);
    } catch (err) {
      const msg = err?.message ?? String(err);
      setError(msg);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredContracts = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    const statusNorm =
      filterStatus === "all" ? null : filterStatus.toLowerCase();
    return contracts.filter((c) => {
      const matchesSearch =
        !s ||
        (c.contractNumber ?? "").toLowerCase().includes(s) ||
        (c.tenant ?? "").toLowerCase().includes(s) ||
        (c.property ?? "").toLowerCase().includes(s) ||
        (c.name ?? "").toLowerCase().includes(s);
      const matchesFilter =
        !statusNorm || (c.status ?? "").toLowerCase() === statusNorm;
      return matchesSearch && matchesFilter;
    });
  }, [contracts, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter(
      (c) => (c.status ?? "").toLowerCase() === "active",
    ).length;
    const pending = contracts.filter(
      (c) =>
        (c.status ?? "").toLowerCase() === "pending" ||
        (c.status ?? "").toLowerCase() === "draft",
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
    stats,
    loading,
    error,
    refetch,
    addContract,
    removeContract,
  };
}
