import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Select, Pagination } from "antd";
import {
  ArrowUpDown,
  Building2,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useHouses } from "../hooks/useHouses";
import HouseCard from "../components/HouseCard";
import CreateHousePage from "./CreateHousePage";
import HouseTranslationReview from "../components/HouseTranslationReview";
import { LoadingSpinner } from "../../../components/shared/Loading";

const PAGE_SIZE = 9;

function getLocalized(translations, fallback) {
  const lang = localStorage.getItem("app_language") ?? "vi";
  return translations?.[lang] || translations?.["vi"] || fallback || "";
}

function ListRow({ house }) {
  const { t } = useTranslation("common");
  const statusCls = {
    AVAILABLE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    RENTED:      "bg-orange-50 text-orange-700 border-orange-200",
    MAINTENANCE: "bg-slate-100 text-slate-600 border-slate-200",
    default:     "bg-gray-50 text-gray-500 border-gray-200",
  };
  const cls   = statusCls[house?.status] ?? statusCls.default;
  const label = t(`houses.status.${house?.status}`, { defaultValue: house?.status ?? "—" });
  const name  = getLocalized(house?.nameTranslations, house?.name ?? house?.title) || t("houses.noName");
  const addr  = getLocalized(house?.addressTranslations, house?.address) || "—";
  const price = house?.rentPrice ?? house?.rent;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200"
      style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.08)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px -4px rgba(59,181,130,0.15)"; e.currentTarget.style.borderColor = "#3bb582"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px -2px rgba(59,181,130,0.08)"; e.currentTarget.style.borderColor = "#C4DED5"; }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EAF4F0" }}>
        <Building2 className="w-5 h-5" style={{ color: "#3bb582" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>{name}</p>
        <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{addr}</p>
      </div>
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${cls}`}>
        {label}
      </span>
      {price != null && price > 0 && (
        <p className="text-sm font-semibold shrink-0 w-28 text-right" style={{ color: "#3bb582" }}>
          ₫{Number(price).toLocaleString("vi-VN")}
          <span className="text-xs font-normal" style={{ color: "#5A7A6E" }}>{t("houses.perMonth")}</span>
        </p>
      )}
      <button
        type="button"
        className="px-3 py-1.5 text-xs font-medium rounded-full transition shrink-0"
        style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
      >
        {t("houses.viewDetail")}
      </button>
    </div>
  );
}

export default function Houses() {
  const { t } = useTranslation("common");
  const [keyword, setKeyword]         = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortValue, setSortValue]     = useState(":");
  const [viewMode, setViewMode]       = useState("grid");
  const [page, setPage]               = useState(1);
  const navigate = useNavigate();
  const [showCreate, setShowCreate]   = useState(false);
  const [pendingHouse, setPendingHouse] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedKeyword(keyword); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleStatusChange = (val) => { setFilterStatus(val); setPage(1); };
  const handleSortChange   = (val) => { setSortValue(val);    setPage(1); };

  const [sortBy, sortDir] = sortValue.split(":");

  const { houses, loading, error, refetch, pagination } = useHouses({
    page,
    size:    PAGE_SIZE,
    keyword: debouncedKeyword,
    sortBy:  sortBy  || "",
    sortDir: sortDir || "",
    status:  filterStatus,
  });

  const sortOptions = [
    { value: ":",         label: t("houses.sortDefault") },
    { value: "name:ASC",  label: t("houses.sortNameAsc") },
    { value: "name:DESC", label: t("houses.sortNameDesc") },
  ];

  const statusOptions = [
    { value: "AVAILABLE",   label: t("houses.status.AVAILABLE")   },
    { value: "RENTED",      label: t("houses.status.RENTED")      },
    { value: "MAINTENANCE", label: t("houses.status.MAINTENANCE") },
  ];

  if (showCreate) {
    return (
      <>
        <CreateHousePage
          onBack={() => setShowCreate(false)}
          onSubmit={(created) => {
            setShowCreate(false);
            refetch();
            if (created) setPendingHouse(created);
          }}
        />
      </>
    );
  }

  return (
    <>
    {pendingHouse && (
      <HouseTranslationReview
        house={pendingHouse}
        onClose={() => setPendingHouse(null)}
        onDone={() => setPendingHouse(null)}
      />
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            {t("houses.title")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-full transition"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "#ffffff"; }}
          >
            <RefreshCw className="w-4 h-4" />
            {t("houses.refresh")}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-full shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4" />
            {t("houses.addNew")}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("houses.searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-full outline-none transition"
            style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
            onFocus={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
            onBlur={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Status filter */}
        <Select
          value={filterStatus || undefined}
          onChange={handleStatusChange}
          placeholder={t("houses.filterAllStatus")}
          allowClear
          style={{ minWidth: 160 }}
          options={statusOptions}
          onClear={() => handleStatusChange("")}
        />

        {/* Sort */}
        <Select
          value={sortValue}
          onChange={handleSortChange}
          style={{ minWidth: 150 }}
          suffixIcon={<ArrowUpDown className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />}
          options={sortOptions}
        />

        {/* View toggle */}
        <div
          className="flex items-center gap-1 rounded-xl p-1 ml-auto"
          style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
        >
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition"
            style={viewMode === "grid"
              ? { background: "#ffffff", boxShadow: "0 1px 4px rgba(59,181,130,0.18)", color: "#3bb582" }
              : { color: "#5A7A6E" }}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition"
            style={viewMode === "list"
              ? { background: "#ffffff", boxShadow: "0 1px 4px rgba(59,181,130,0.18)", color: "#3bb582" }
              : { color: "#5A7A6E" }}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="rounded-2xl p-12 flex justify-center"
          style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}
        >
          <LoadingSpinner size="lg" showLabel label={t("houses.loading")} />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="font-medium text-sm" style={{ color: "#D95F4B" }}>
            {t("houses.loadError")}
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && houses.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EAF4F0" }}>
            <Building2 className="w-8 h-8" style={{ color: "#3bb582" }} />
          </div>
          <h3 className="font-semibold" style={{ color: "#1E2D28" }}>{t("houses.empty")}</h3>
          <p className="mt-1.5 text-sm max-w-xs mx-auto" style={{ color: "#5A7A6E" }}>
            {t("houses.emptyHint")}
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && houses.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {houses.map((house) => (
                <HouseCard
                  key={house.id}
                  house={house}
                  onView={(h) => navigate(`/houses/${h.id}`)}
                  onEdit={(h) => console.log("edit", h?.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {houses.map((house) => (
                <ListRow key={house.id} house={house} />
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Pagination
              current={page}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

    </div>
    </>
  );
}
