import React from "react";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs";
import ContractsHeader from "../../components/ContractsHeader";
import ContractsStats from "../../components/ContractsStats";
import ContractsFilters from "../../components/ContractsFilters";
import ContractsTable from "../../components/ContractsTable";

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
  loading,
  error,
  onRetry,
}) {
  return (
    <div className="space-y-6">
      <ContractsHeader total={contracts.length} onCreate={onCreate} />
      <ContractsStats stats={stats} />

      <ContractsFilters
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        filterStatus={filterStatus}
        onFilter={setFilterStatus}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      <ContractsTable
        items={filteredContracts}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        loading={loading}
      />
    </div>
  );
}
