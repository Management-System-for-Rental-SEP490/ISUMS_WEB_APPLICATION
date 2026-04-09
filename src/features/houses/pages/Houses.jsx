import { useEffect, useState } from "react";
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react";
import { useHouses } from "../hooks/useHouses";
import HouseCard from "../components/HouseCard";
import HouseDetailModal from "../components/HouseDetailModal";
import CreateHousePage from "./CreateHousePage";
import { LoadingSpinner } from "../../../components/shared/Loading";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: ":",         label: "Mặc định" },
  { value: "name:ASC",  label: "Tên A → Z" },
  { value: "name:DESC", label: "Tên Z → A" },
];

const STATUS_BADGE = {
  AVAILABLE:   { label: "Còn trống", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  RENTED:      { label: "Đã thuê",   cls: "bg-orange-50 text-orange-700 border-orange-200"   },
  MAINTENANCE: { label: "Bảo trì",   cls: "bg-slate-100 text-slate-600 border-slate-200"     },
  default:     { label: "—",         cls: "bg-gray-50 text-gray-500 border-gray-200"          },
};

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={[
              "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition",
              p === current
                ? "bg-teal-600 text-white shadow-sm"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ListRow({ house }) {
  const b     = STATUS_BADGE[house?.status] ?? STATUS_BADGE.default;
  const name  = house?.name ?? house?.title ?? "Chưa đặt tên";
  const addr  = house?.address ?? "—";
  const price = house?.rentPrice ?? house?.rent;

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 hover:shadow-md transition">
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5 text-teal-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
        <p className="text-xs text-slate-500 truncate">{addr}</p>
      </div>
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${b.cls}`}>
        {b.label}
      </span>
      {price != null && price > 0 && (
        <p className="text-sm font-semibold text-teal-600 shrink-0 w-28 text-right">
          ₫{Number(price).toLocaleString("vi-VN")}
          <span className="text-xs font-normal text-slate-400">/th</span>
        </p>
      )}
      <button
        type="button"
        className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition shrink-0"
      >
        Xem chi tiết
      </button>
    </div>
  );
}

/* ── Main page ── */
export default function Houses() {
  const [keyword, setKeyword]         = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortValue, setSortValue]     = useState(":");
  const [viewMode, setViewMode]       = useState("grid");
  const [page, setPage]               = useState(1);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);

  // Debounce keyword 400ms before sending to API
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedKeyword(keyword); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  // Reset page when filters change
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

  if (showCreate) {
    return (
      <CreateHousePage
        onBack={() => setShowCreate(false)}
        onSubmit={() => { setShowCreate(false); refetch(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Bất động sản</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng số {pagination.total} bất động sản đang quản lý
            {loading && " • Đang tải..."}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm bất động sản
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên nhà..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 text-slate-700 cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="AVAILABLE">Còn trống</option>
          <option value="RENTED">Đã thuê</option>
          <option value="MAINTENANCE">Bảo trì</option>
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={["w-8 h-8 flex items-center justify-center rounded-lg transition",
              viewMode === "grid" ? "bg-white shadow-sm text-teal-600" : "text-slate-400 hover:text-slate-600"].join(" ")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={["w-8 h-8 flex items-center justify-center rounded-lg transition",
              viewMode === "list" ? "bg-white shadow-sm text-teal-600" : "text-slate-400 hover:text-slate-600"].join(" ")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm flex justify-center">
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách nhà..." />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="text-red-600 font-medium text-sm">
            Không tải được danh sách nhà. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && houses.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="font-semibold text-slate-800">Không tìm thấy bất động sản phù hợp</h3>
          <p className="mt-1.5 text-slate-500 text-sm max-w-xs mx-auto">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
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
                  onView={(h) => setSelectedHouse(h)}
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

          <Pagination
            current={page}
            total={pagination.totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}

      <HouseDetailModal house={selectedHouse} onClose={() => setSelectedHouse(null)} />
    </div>
  );
}
