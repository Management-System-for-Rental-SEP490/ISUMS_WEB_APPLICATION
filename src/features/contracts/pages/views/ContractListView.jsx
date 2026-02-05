import React from "react";
import Breadcrumbs from "../../components/components/Breadscrumbs";
import ContractsHeader from "../../components/components/ContractsHeader";
import ContractsStats from "../../components/components/ContractsStats";
import ContractsFilters from "../../components/components/ContractsFilters";
import ContractsTable from "../../components/components/ContractsTable";

export default function ContractsListView({
  onNavigateMenu,
  onCreate,
  onViewDetail,
  onEdit,
  onDelete,
  contracts,
  filteredContracts,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  stats,
}) {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", onClick: () => onNavigateMenu?.("dashboard") },
          { label: "Quản lý hợp đồng" },
        ]}
      />

      <ContractsHeader total={contracts.length} onCreate={onCreate} />
      <ContractsStats stats={stats} />

      <ContractsFilters
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        filterStatus={filterStatus}
        onFilter={setFilterStatus}
      />

      <ContractsTable
        items={filteredContracts}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
