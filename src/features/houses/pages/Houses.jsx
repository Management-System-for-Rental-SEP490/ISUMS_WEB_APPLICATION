import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Pagination } from "antd";
import {
  ArrowUpDown,
  Building2,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useHouses } from "../hooks/useHouses";
import HouseCard from "../components/HouseCard";
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


function ListRow({ house }) {
  const b     = STATUS_BADGE[house?.status] ?? STATUS_BADGE.default;
  const name  = house?.name ?? house?.title ?? "Chưa đặt tên";
  const addr  = house?.address ?? "—";
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
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${b.cls}`}>
        {b.label}
      </span>
      {price != null && price > 0 && (
        <p className="text-sm font-semibold shrink-0 w-28 text-right" style={{ color: "#3bb582" }}>
          ₫{Number(price).toLocaleString("vi-VN")}
          <span className="text-xs font-normal" style={{ color: "#5A7A6E" }}>/th</span>
        </p>
      )}
      <button
        type="button"
        className="px-3 py-1.5 text-xs font-medium rounded-full transition shrink-0"
        style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "transparent"; }}
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
  const navigate = useNavigate();
  const [showCreate, setShowCreate]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedKeyword(keyword); setPage(1); }, 400);
    return () => clearTimeout(t);
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
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>
              Bất động sản
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            Quản lý Bất động sản
          </h2>
          <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>
            Tổng số {pagination.total} bất động sản đang quản lý
            {loading && " • Đang tải..."}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-full shadow-sm transition"
          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm bất động sản
        </button>
      </div>

      {/* Filter bar */}
      <div
        className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
        style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên nhà..."
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
          placeholder="Tất cả trạng thái"
          allowClear
          style={{ minWidth: 160 }}
          options={[
            { value: "AVAILABLE",   label: "Còn trống" },
            { value: "RENTED",      label: "Đã thuê"   },
            { value: "MAINTENANCE", label: "Bảo trì"   },
          ]}
          onClear={() => handleStatusChange("")}
        />

        {/* Sort */}
        <Select
          value={sortValue}
          onChange={handleSortChange}
          style={{ minWidth: 150 }}
          suffixIcon={<ArrowUpDown className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />}
          options={SORT_OPTIONS}
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
          style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}
        >
          <LoadingSpinner size="lg" showLabel label="Đang tải danh sách nhà..." />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl p-6" style={{ background: "#FAFFFE", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="font-medium text-sm" style={{ color: "#D95F4B" }}>
            Không tải được danh sách nhà. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && houses.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EAF4F0" }}>
            <Building2 className="w-8 h-8" style={{ color: "#3bb582" }} />
          </div>
          <h3 className="font-semibold" style={{ color: "#1E2D28" }}>Không tìm thấy bất động sản phù hợp</h3>
          <p className="mt-1.5 text-sm max-w-xs mx-auto" style={{ color: "#5A7A6E" }}>
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
        </>
      )}

    </div>
  );
}
