import React, { useMemo, useState, useCallback } from "react";
import { useContracts } from "../../../features/contracts/hooks/useContract";
import ContractsListView from "./views/ContractListView";
import ContractCreateView from "./views/ContractCreateView";
import ContractDetailView from "./views/ContractDetailView";
import ContractEditView from "./views/ContractEditView";

export default function ContractsPage({ onNavigateMenu }) {
  const [view, setView] = useState("list"); // list | create | detail | edit
  const [selectedId, setSelectedId] = useState(null);

  const {
    contracts,
    filteredContracts,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    stats,
    addContract,
    removeContract,
  } = useContracts();

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedId) ?? null,
    [contracts, selectedId]
  );

  const goList = useCallback(() => {
    setView("list");
    setSelectedId(null);
  }, []);

  const goCreate = useCallback(() => setView("create"), []);
  const goDetail = useCallback((id) => {
    setSelectedId(id);
    setView("detail");
  }, []);
  const goEdit = useCallback((id) => {
    setSelectedId(id);
    setView("edit");
  }, []);

  const handleDelete = useCallback(
    (id) => {
      removeContract(id);
      if (selectedId === id) goList();
    },
    [removeContract, selectedId, goList]
  );

  if (view === "create") {
    return (
      <ContractCreateView
        onNavigateMenu={onNavigateMenu}
        onBack={goList}
        onCreated={(payload) => {
          if (payload) {
            const contract = {
              contractNumber: payload.contractNumber,
              tenant: payload.tenantName,
              property: payload.propertyName,
              unit: payload.unit,
              startDate: payload.startDate,
              endDate: payload.endDate,
              rent: Number(payload.rent) || 0,
              deposit: Number(payload.deposit) || 0,
              status: "pending",
              paymentType: payload.paymentType || "monthly",
              autoRenew: payload.autoRenew ?? true,
            };
            addContract(contract);
          }
          goList();
        }}
      />
    );
  }

  if (view === "detail") {
    return (
      <ContractDetailView
        onNavigateMenu={onNavigateMenu}
        contract={selectedContract}
        onBack={goList}
        onEdit={goEdit}
      />
    );
  }

  if (view === "edit") {
    return (
      <ContractEditView
        onNavigateMenu={onNavigateMenu}
        contract={selectedContract}
        onBack={goList}
      />
    );
  }

  return (
    <ContractsListView
      onNavigateMenu={onNavigateMenu}
      onCreate={goCreate}
      onViewDetail={goDetail}
      onEdit={goEdit}
      onDelete={handleDelete}
      contracts={contracts}
      filteredContracts={filteredContracts}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      stats={stats}
    />
  );
}
