import { useState } from "react";
import { Package, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import AssetRow from "./AssetRow";

const PAGE_SIZE = 5;

const TABLE_HEADERS = ["TÊN TÀI SẢN", "LOẠI SỰ KIỆN", "TRẠNG THÁI KỸ THUẬT", "GHI CHÚ", "THỜI GIAN", ""];

export default function AssetEventsTable({ events = [] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pageItems = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid #C4DED5", boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)" }}
    >
      {/* Header bar */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: "#3bb582" }} />
          <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>
            Tài sản đã ghi nhận
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EAF4F0", color: "#3bb582" }}>
              {String(events.length).padStart(2, "0")}
            </span>
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "rgba(59,181,130,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.color = "#5A7A6E"; e.currentTarget.style.background = "#ffffff"; }}
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm tài sản
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: "#FAFFFE", borderBottom: "1px solid rgba(196,222,213,0.5)" }}>
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className={`py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${h === "TÊN TÀI SẢN" ? "pl-5" : ""} pr-4`}
                style={{ color: "#5A7A6E" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageItems.length > 0 ? (
            pageItems.map((event) => <AssetRow key={event.id} event={event} />)
          ) : (
            <tr>
              <td colSpan={6} className="py-14 text-center">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: "#EAF4F0" }}>
                  <Package className="w-5 h-5" style={{ color: "#5A7A6E" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Chưa có tài sản nào</p>
                <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>Nhấn "+ Thêm tài sản" để ghi nhận</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(196,222,213,0.5)" }}>
          <p className="text-xs" style={{ color: "#5A7A6E" }}>
            Hiển thị {Math.min(pageItems.length, PAGE_SIZE)} / {events.length} mục
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-40"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />Trước
            </button>
            <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
              {page}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-40"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
            >
              Tiếp<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
