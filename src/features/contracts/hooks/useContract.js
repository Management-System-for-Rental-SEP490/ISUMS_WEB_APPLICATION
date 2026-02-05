import { useMemo, useState, useCallback } from "react";
import { CONTRACTS_DEMO } from "../mocks/contract.mock";

export function useContracts() {
  const [contracts, setContracts] = useState(CONTRACTS_DEMO);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredContracts = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return contracts.filter((c) => {
      const matchesSearch =
        !s ||
        c.contractNumber.toLowerCase().includes(s) ||
        c.tenant.toLowerCase().includes(s) ||
        c.property.toLowerCase().includes(s);
      const matchesFilter = filterStatus === "all" || c.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [contracts, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === "active").length;
    const pending = contracts.filter((c) => c.status === "pending").length;
    const totalRent = contracts.reduce((sum, c) => sum + c.rent, 0);
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
    addContract,
    removeContract,
  };
}
