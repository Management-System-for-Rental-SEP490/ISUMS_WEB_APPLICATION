import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";
import {
  Search,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  BarChart2,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { useLanguageStore } from "../../../store/languageStore";
import { getAssetItems } from "../api/assets.api";
import { conditionColor } from "../../houses/components/HouseOverviewTab";
import AssetItemDetailDrawer from "../components/AssetItemDetailDrawer";

const PAGE_SIZE = 10;

const STATUS_FILTERS = ["", "IN_USE", "WAITING_MANAGER_CONFIRM", "BROKEN"];

const STATUS_STYLE = {
  IN_USE: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    label: "houses.assetStatus.IN_USE",
  },
  WAITING_MANAGER_CONFIRM: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    label: "houses.assetStatus.WAITING_MANAGER_CONFIRM",
  },
  BROKEN: {
    dot: "bg-red-500",
    text: "text-red-500",
    label: "houses.assetStatus.BROKEN",
  },
  DISPOSED: {
    dot: "bg-red-400",
    text: "text-red-400",
    label: "houses.assetStatus.DISPOSED",
  },
  default: {
    dot: "bg-gray-300",
    text: "text-gray-400",
    label: "houses.assetStatus.default",
  },
};

function getDisplayName(item, lang) {
  if (lang !== "vi" && item.translations?.[lang])
    return item.translations[lang];
  return item.displayName;
}

function getCategoryName(item, lang) {
  if (lang !== "vi" && item.category?.nameTranslations?.[lang])
    return item.category.nameTranslations[lang];
  return item.category?.name ?? "—";
}

export default function AssetsPage() {
  const { t } = useTranslation("common");
  const lang = useLanguageStore((s) => s.language);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ IN_USE: 0, WAITING_MANAGER_CONFIRM: 0, BROKEN: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [sortDir, setSortDir] = useState("DESC");

  const debounceRef = useRef(null);

  const fetchItems = useCallback(async (p, kw, status, dir = "DESC") => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssetItems({
        page: p,
        size: PAGE_SIZE,
        keyword: kw || undefined,
        status: status || undefined,
        sortBy: "createdAt",
        sortDir: dir,
      });
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stat counts once on mount
  useEffect(() => {
    Promise.all([
      getAssetItems({ page: 1, size: 1, status: "IN_USE" }),
      getAssetItems({ page: 1, size: 1, status: "WAITING_MANAGER_CONFIRM" }),
      getAssetItems({ page: 1, size: 1, status: "BROKEN" }),
    ])
      .then(([inUse, waitingApprove, broken]) => {
        setStats({
          IN_USE: inUse?.total ?? 0,
          WAITING_MANAGER_CONFIRM: waitingApprove?.total ?? 0,
          BROKEN: broken?.total ?? 0,
        });
      })
      .catch(() => {});
    fetchItems(1, "", "", "DESC");
  }, []);

  const avgCondition =
    items.length > 0
      ? Math.round(
          items.reduce((s, i) => s + (i.conditionPercent ?? 0), 0) /
            items.length,
        )
      : 0;

  const handleSearch = (value) => {
    setKeyword(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchItems(1, value, statusFilter, sortDir);
    }, 400);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchItems(1, keyword, status, sortDir);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchItems(p, keyword, statusFilter, sortDir);
  };

  const handleToggleSort = () => {
    const next = sortDir === "DESC" ? "ASC" : "DESC";
    setSortDir(next);
    setPage(1);
    fetchItems(1, keyword, statusFilter, next);
  };

  const handleRefresh = () => {
    fetchItems(page, keyword, statusFilter, sortDir);
  };

  const statCards = [
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      value: stats.IN_USE,
      label: t("houses.assetStatus.IN_USE"),
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      value: stats.WAITING_MANAGER_CONFIRM,
      label: t("houses.assetStatus.WAITING_MANAGER_CONFIRM"),
    },
    {
      icon: Zap,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      value: stats.BROKEN,
      label: t("assets.statBroken"),
    },
    {
      icon: BarChart2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      value: `${avgCondition}%`,
      label: t("assets.statAvgCondition"),
    },
  ];

  const filterTabs = STATUS_FILTERS.map((s) => {
    const count =
      s === ""
        ? total
        : s === "IN_USE"
          ? stats.IN_USE
          : s === "WAITING_MANAGER_CONFIRM"
            ? stats.WAITING_MANAGER_CONFIRM
            : stats.BROKEN;
    const label =
      s === ""
        ? t("assets.filterAll")
        : s === "IN_USE"
          ? t("houses.assetStatus.IN_USE")
          : s === "WAITING_MANAGER_CONFIRM"
            ? t("houses.assetStatus.WAITING_MANAGER_CONFIRM")
            : t("assets.statBroken");
    return { value: s, label, count };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E2D28" }}>
            {t("assets.title")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>
            {t("assets.subtitle", { total })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "#ffffff"; }}
          >
            <RefreshCw className="w-4 h-4" />
            {t("actions.refresh")}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-full shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus className="w-4 h-4" />
            {t("assets.create")}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ icon: Icon, iconBg, iconColor, value, label }) => (
          <div
            key={label}
            className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid #C4DED5" }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#1E2D28" }}>
                {value}
              </p>
              <p className="text-xs" style={{ color: "#5A7A6E" }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map(({ value, label, count }) => {
            const active = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => handleStatusFilter(value)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                style={
                  active
                    ? { background: "#3bb582", color: "#ffffff" }
                    : {
                        background: "#ffffff",
                        color: "#5A7A6E",
                        border: "1px solid #C4DED5",
                      }
                }
              >
                {label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSort}
            title={sortDir === "DESC" ? t("assets.sortOldest") : t("assets.sortNewest")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition shrink-0"
            style={{ background: "#ffffff", border: "1px solid #C4DED5", color: "#5A7A6E" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.borderColor = "#3bb582"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.borderColor = "#C4DED5"; }}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortDir === "DESC" ? t("assets.sortNewest") : t("assets.sortOldest")}
          </button>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#ffffff", border: "1px solid #C4DED5", maxWidth: 280, flex: 1 }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder={t("assets.searchPlaceholder")}
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "#1E2D28" }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl"
          style={{ border: "1px solid #C4DED5" }}
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm" style={{ color: "#5A7A6E" }}>
            {error}
          </p>
          <button
            onClick={() => fetchItems(page, keyword, statusFilter)}
            className="text-sm font-medium px-4 py-2 rounded-xl transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
          >
            {t("actions.submit")}
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #C4DED5" }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 py-3 text-xs font-bold uppercase tracking-widest"
            style={{
              color: "#5A7A6E",
              borderBottom: "1px solid #EAF4F0",
              gridTemplateColumns: "40px 1fr 160px 180px 180px 120px",
            }}
          >
            <div>#</div>
            <div>{t("assets.colName")}</div>
            <div>{t("assets.colCategory")}</div>
            <div>{t("assets.colStatus")}</div>
            <div>{t("assets.colCondition")}</div>
            <div className="pl-8">{t("table.actions")}</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="grid items-center px-5 py-4 animate-pulse"
                  style={{
                    borderBottom: "1px solid #F3F4F6",
                    gridTemplateColumns: "40px 1fr 160px 180px 180px 120px",
                  }}
                >
                  <div className="h-3 bg-gray-100 rounded w-5" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-40" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-2 bg-gray-100 rounded w-32" />
                  <div className="h-6 bg-gray-100 rounded w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm" style={{ color: "#5A7A6E" }}>
                {t("assets.empty")}
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const st = STATUS_STYLE[item.status] ?? STATUS_STYLE.default;
              const pct = item.conditionPercent ?? 0;
              const cc = conditionColor(pct);
              const rowNo = (page - 1) * PAGE_SIZE + idx + 1;
              return (
                <div
                  key={item.id}
                  className="grid items-center px-5 py-3.5 transition-colors"
                  style={{
                    borderBottom: "1px solid #F3F4F6",
                    gridTemplateColumns: "40px 1fr 160px 180px 180px 120px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAFFFE")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Row number */}
                  <div
                    className="text-xs font-medium"
                    style={{ color: "#9CA3AF" }}
                  >
                    {rowNo}
                  </div>

                  {/* Name + serial */}
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#1E2D28" }}
                    >
                      {getDisplayName(item, lang)}
                    </p>
                    {item.serialNumber && (
                      <p
                        className="text-xs font-mono mt-0.5"
                        style={{ color: "#9CA3AF" }}
                      >
                        {item.serialNumber}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <span
                      className="px-3 py-1 text-xs rounded-full"
                      style={{ background: "#F3F4F6", color: "#5A7A6E" }}
                    >
                      {getCategoryName(item, lang)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`}
                    />
                    <span className={`text-sm font-medium ${st.text}`}>
                      {t(st.label, { defaultValue: item.status })}
                    </span>
                  </div>

                  {/* Condition */}
                  <div className="flex items-center gap-2 pr-4">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#E5E7EB" }}
                    >
                      <div
                        className={`h-full rounded-full ${cc.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 w-10 text-right ${cc.text}`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 w-full">
                    <button
                      type="button"
                      title={t("houses.viewDetail")}
                      onClick={() => setSelectedId(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                      style={{ color: "#5A7A6E" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EAF4F0";
                        e.currentTarget.style.color = "#3bb582";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#5A7A6E";
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title={t("actions.edit")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                      style={{ color: "#5A7A6E" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EAF4F0";
                        e.currentTarget.style.color = "#2096d8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#5A7A6E";
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title={t("actions.delete")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                      style={{ color: "#5A7A6E" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FEF2F2";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#5A7A6E";
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div
              className="flex justify-end px-5 py-3"
              style={{ borderTop: "1px solid #EAF4F0" }}
            >
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}

      <AssetItemDetailDrawer
        assetId={selectedId}
        onClose={() => setSelectedId(null)}
        onConfirmed={() => fetchItems(page, keyword, statusFilter)}
      />
    </div>
  );
}
