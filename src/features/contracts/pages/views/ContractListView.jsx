import React from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs";
import ContractsHeader from "../../components/list/ContractsHeader";
import ContractsStats from "../../components/list/ContractsStats";
import ContractsFilters from "../../components/list/ContractsFilters";
import ContractsTable from "../../components/list/ContractsTable";

export default function ContractsListView({
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
  onRetry,
  onRefresh,
}) {
  const { t } = useTranslation("common");
  return (
    <div className="space-y-6">
      <ContractsHeader total={totalItems} onCreate={onCreate} />
      <ContractsStats stats={stats} />

      <ContractsFilters
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        filterStatus={filterStatus}
        onFilter={setFilterStatus}
        sortDir={sortDir}
        onToggleSortDir={onToggleSortDir}
        onRefresh={onRefresh}
        refreshing={loading}
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
              {t("contracts.table.retry")}
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

      {!loading && !error && totalItems > 0 && (
        <div className="flex justify-end">
          <Pagination
            current={page}
            total={totalItems}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
