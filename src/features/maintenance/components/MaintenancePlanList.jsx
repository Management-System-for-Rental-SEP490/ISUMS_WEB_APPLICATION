import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import MaintenancePlanCard from "./MaintenancePlanCard";

export default function MaintenancePlanList({ plans, onViewJobs, onEdit }) {
  const { t } = useTranslation("common");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const STATUS_FILTERS = [
    { value: "ALL",       label: t("maintenance.planList.filterAll")       },
    { value: "ACTIVE",    label: t("maintenance.planList.filterActive")    },
    { value: "INACTIVE",  label: t("maintenance.planList.filterInactive")  },
    { value: "COMPLETED", label: t("maintenance.planList.filterCompleted") },
  ];

  const filtered = plans.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.houseName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10 transition">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("maintenance.planList.searchPlaceholder")}
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 text-xs font-semibold transition ${
                statusFilter === f.value
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{t("maintenance.planList.emptyTitle")}</p>
          <p className="text-xs mt-1">{t("maintenance.planList.emptyHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <MaintenancePlanCard
              key={plan.id}
              plan={plan}
              onViewJobs={() => onViewJobs(plan)}
              onEdit={() => onEdit(plan)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
