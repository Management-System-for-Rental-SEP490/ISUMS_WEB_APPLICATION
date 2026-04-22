import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useContracts } from "../../../features/contracts/hooks/useContract";
import ContractsListView from "./views/ContractListView";
import ContractCreateView from "./views/ContractCreateView";

export default function ContractsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const {
    contracts,
    filteredContracts,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortDir,
    onToggleSortDir,
    page,
    totalPage,
    totalItems,
    pageSize,
    onPageChange,
    stats,
    loading,
    error,
    refetch,
    addContract,
    removeContract,
  } = useContracts();

  const selectedContract = contracts.find((c) => c.id === selectedId) ?? null;

  const goList = useCallback(() => {
    setView("list");
    setSelectedId(null);
  }, []);

  const goCreate = useCallback(() => setView("create"), []);

  const goDetail = useCallback(
    (id) => {
      navigate(`/contracts/${id}`);
    },
    [navigate],
  );

  const goEdit = useCallback(
    (id) => {
      const contract = contracts.find((c) => c.id === id);
      const status = (contract?.status ?? "").toUpperCase();
      if (status !== "DRAFT" && status !== "READY") {
        toast.warning(t("contract.toastNotEditable"));
        return;
      }
      navigate(`/contracts/${id}/edit`);
    },
    [contracts, navigate],
  );

  const handleDelete = useCallback(
    (id) => {
      removeContract(id);
      if (selectedId === id) goList();
    },
    [removeContract, selectedId, goList],
  );

  if (view === "create") {
    return (
      <ContractCreateView
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
          refetch();
        }}
      />
    );
  }

  return (
    <ContractsListView
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
      sortDir={sortDir}
      onToggleSortDir={onToggleSortDir}
      page={page}
      totalPage={totalPage}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      stats={stats}
      loading={loading}
      error={error}
      onRetry={refetch}
      onRefresh={refetch}
    />
  );
}
