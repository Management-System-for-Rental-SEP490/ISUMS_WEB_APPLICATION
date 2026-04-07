import { Building2, Users, FileText, TrendingUp, TrendingDown, Clock, AlertCircle, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardMap from "./components/DashboardMap";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { STATUS_LABEL, STATUS_BADGE } from "../contracts/utils/contract.constants";

const EXPIRING_DAYS = 30;

const COLOR_MAP = {
  teal:  { bg: "bg-teal-50",  icon: "text-teal-600",  border: "border-teal-100"  },
  blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  border: "border-blue-100"  },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
};


function StatCard({ title, value, subtitle, icon: Icon, color, error, loading }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${c.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {error && (
          <span title={error}>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      {loading ? (
        <div className="h-9 w-16 bg-gray-100 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</p>
      )}
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function ContractRow({ contract }) {
  const navigate = useNavigate();

  const statusLabel = STATUS_LABEL[contract.status] ?? contract.status ?? "—";
  const statusCls = STATUS_BADGE[contract.status] ?? "bg-gray-100 text-gray-500 border border-gray-200";

  const endLabel = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString("vi-VN")
    : "—";

  return (
    <li className="px-5 py-3.5 hover:bg-gray-50 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {contract.tenant ?? contract.name ?? "—"}
          </p>
          {(contract.property ?? contract.houseName) && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {contract.property ?? contract.houseName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusCls}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/contracts/${contract.id}`)}
            className="p-1 rounded-md text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Xem chi tiết"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">Hết hạn: {endLabel}</p>
    </li>
  );
}

export default function DashboardPage() {
  const { stats, houses, recentContracts, loading, errors } = useDashboardStats();

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      key: "properties",
      title: "Bất động sản cho thuê",
      value: stats.properties.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số trong hệ thống",
      icon: Building2,
      color: "teal",
      error: errors.properties,
    },
    {
      key: "users",
      title: "Người dùng hệ thống",
      value: stats.users.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số người dùng",
      icon: Users,
      color: "blue",
      error: errors.users,
    },
    {
      key: "contracts",
      title: "Hợp đồng",
      value: stats.contracts.total.toLocaleString("vi-VN"),
      subtitle: "Tổng số hợp đồng",
      icon: FileText,
      color: "amber",
      error: errors.contracts,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((s) => (
          <StatCard key={s.key} title={s.title} value={s.value} subtitle={s.subtitle} icon={s.icon} color={s.color} error={s.error} loading={loading} />
        ))}
      </div>

      {/* Map + Recent Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DashboardMap houses={houses} />
        </div>

        {/* Recent contracts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col" style={{ minHeight: 560 }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Hợp đồng gần đây</h3>
            {stats.contracts.expiring > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {stats.contracts.expiring} sắp hết hạn
              </span>
            )}
          </div>

          {loading ? (
            <ul className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-5 py-3.5 space-y-2">
                  <div className="h-3.5 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                </li>
              ))}
            </ul>
          ) : errors.contracts ? (
            <p className="px-5 py-6 text-sm text-red-500">{errors.contracts}</p>
          ) : recentContracts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Chưa có hợp đồng nào.</p>
          ) : (
            <ul className="divide-y divide-gray-50 overflow-y-auto flex-1">
              {recentContracts.map((c) => (
                <ContractRow key={c.id} contract={c} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
