import { useEffect, useState } from "react";
import { RefreshCw, ClipboardCheck, Eye, Plus } from "lucide-react";
import { getInspections } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import CreateInspectionModal from "../components/CreateInspectionModal";

const STATUS_CONFIG = {
  DONE: {
    label: "Hoàn thành",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  PENDING: {
    label: "Chờ thực hiện",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "PENDING", label: "Chờ thực hiện" },
  { value: "IN_PROGRESS", label: "Đang tiến hành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function DetailModal({ inspection, onClose }) {
  const [house, setHouse] = useState(null);
  const [staff, setStaff] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!inspection) return;
    setHouse(null);
    setStaff(null);
    setFetching(true);
    Promise.all([
      inspection.houseId ? getHouseById(inspection.houseId).catch(() => null) : Promise.resolve(null),
      inspection.assignedStaffId ? getUserById(inspection.assignedStaffId).catch(() => null) : Promise.resolve(null),
    ]).then(([houseData, staffData]) => {
      setHouse(houseData);
      setStaff(staffData);
      setFetching(false);
    });
  }, [inspection]);

  if (!inspection) return null;
  const st = STATUS_CONFIG[inspection.status] ?? {
    label: inspection.status,
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-300",
  };

  const houseName = house?.name ?? house?.houseName ?? null;
  const staffName = staff?.fullName ?? staff?.name ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">Chi tiết kiểm tra</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
          >
            ✕
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          {[
            { label: "Tòa nhà", value: fetching ? "Đang tải..." : (houseName ?? "—") },
            { label: "Địa chỉ", value: fetching ? "Đang tải..." : ([house?.address, house?.ward, house?.city].filter(Boolean).join(", ") || "—") },
            { label: "Nhân viên", value: fetching ? "Đang tải..." : (staffName ?? "Chưa phân công") },
            { label: "Ghi chú", value: inspection.note || "—" },
            { label: "Ngày tạo", value: formatDate(inspection.createdAt) },
            { label: "Cập nhật", value: formatDate(inspection.updatedAt) },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <dt className="w-32 flex-shrink-0 text-slate-400 font-medium">{label}</dt>
              <dd className="text-slate-700 break-words flex-1">{value}</dd>
            </div>
          ))}
          <div className="flex gap-3 items-center">
            <dt className="w-32 flex-shrink-0 text-slate-400 font-medium">Trạng thái</dt>
            <dd>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchInspections = (status = statusFilter) => {
    setLoading(true);
    setError(null);
    getInspections(status || undefined)
      .then((data) => setInspections(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    fetchInspections(val);
  };

  const statusCounts = inspections.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kiểm tra nhà cửa</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Danh sách các lần kiểm tra bất động sản trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => fetchInspections()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo kiểm tra
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng", value: inspections.length, color: "text-slate-700" },
          { label: "Hoàn thành", value: statusCounts.DONE ?? 0, color: "text-green-600" },
          { label: "Chờ thực hiện", value: statusCounts.PENDING ?? 0, color: "text-yellow-600" },
          { label: "Đang tiến hành", value: statusCounts.IN_PROGRESS ?? 0, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>
              {loading ? "—" : String(s.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-slate-100 last:border-0 flex items-center gap-4">
              <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="w-28 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="flex-1 h-3 bg-slate-100 rounded animate-pulse" />
              <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchInspections()}
            className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600 transition underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && inspections.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">Chưa có dữ liệu kiểm tra</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && inspections.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[40px_2fr_120px_110px_80px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {["STT", "Ghi chú", "Ngày tạo", "Trạng thái", "Thao tác"].map((h) => (
              <p key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {inspections.map((item, index) => {
            const st = STATUS_CONFIG[item.status] ?? {
              label: item.status,
              bg: "bg-slate-50",
              text: "text-slate-600",
              dot: "bg-slate-300",
            };
            return (
              <div
                key={item.id}
                className="grid grid-cols-[40px_2fr_120px_110px_80px] gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition items-center"
              >
                <p className="text-xs font-semibold text-slate-400">{index + 1}</p>
                <p className="text-xs text-slate-600 truncate" title={item.note}>
                  {item.note || "—"}
                </p>
                <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold w-fit ${st.bg} ${st.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedInspection(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Chi tiết
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        inspection={selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />

      {/* Create Modal */}
      <CreateInspectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          fetchInspections();
        }}
      />
    </div>
  );
}
