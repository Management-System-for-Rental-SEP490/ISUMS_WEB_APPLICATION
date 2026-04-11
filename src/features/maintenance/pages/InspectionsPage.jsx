import { useEffect, useState } from "react";
import { RefreshCw, ClipboardCheck, Eye, Plus, MapPin, User, Calendar, FileText, Tag, X, Phone } from "lucide-react";
import { getInspections } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import CreateInspectionModal from "../components/CreateInspectionModal";

const STATUS_CONFIG = {
  CREATED: {
    label: "Mới tạo",
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  SCHEDULED: {
    label: "Đã lên lịch",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  DONE: {
    label: "Hoàn thành",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

const TYPE_CONFIG = {
  CHECK_IN: {
    label: "Check-in",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  CHECK_OUT: {
    label: "Check-out",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "CREATED", label: "Mới tạo" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "IN_PROGRESS", label: "Đang tiến hành" },
  { value: "DONE", label: "Hoàn thành" },
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
  const tp = inspection.type ? (TYPE_CONFIG[inspection.type] ?? { label: inspection.type, bg: "bg-slate-50", text: "text-slate-600" }) : null;

  const houseName = house?.name ?? house?.houseName ?? null;
  const houseAddress = fetching ? null : ([house?.address, house?.ward, house?.city].filter(Boolean).join(", ") || null);
  const staffName = staff?.fullName ?? staff?.name ?? null;
  const staffPhone = staff?.phoneNumber ?? null;
  const staffEmail = staff?.email ?? null;
  const staffRole = staff?.roles?.[0] ?? null;
  const staffInitial = staffName ? staffName.trim().split(" ").pop()[0].toUpperCase() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Banner */}
        <div className="relative h-28 bg-gradient-to-br from-teal-500 to-teal-700 px-6 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-xs font-medium mb-1">Chi tiết kiểm tra</p>
              <p className="text-white text-xs font-mono opacity-60 truncate max-w-[260px]">#{inspection.id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Badges float on banner */}
          <div className="absolute -bottom-4 left-6 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border border-white/60 ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {tp && (
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md border border-white/60 ${tp.bg} ${tp.text}`}>
                {tp.label}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-8 pb-6 space-y-4">

          {/* House card */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Thông tin nhà</p>
              {fetching ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800 truncate">{houseName ?? "—"}</p>
                  {houseAddress && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{houseAddress}</p>}
                </>
              )}
            </div>
          </div>

          {/* Staff card */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
            {fetching ? (
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse flex-shrink-0" />
            ) : staffInitial ? (
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-indigo-600">{staffInitial}</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 font-medium mb-1">Nhân viên phụ trách</p>
              {fetching ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : staffName ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{staffName}</p>
                  {staffPhone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a href={`tel:${staffPhone}`} className="hover:text-teal-600 transition">{staffPhone}</a>
                    </p>
                  )}
                  {staffEmail && (
                    <p className="text-xs text-slate-500 truncate">{staffEmail}</p>
                  )}
                  {staffRole && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 mt-0.5">
                      {staffRole}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Chưa phân công</p>
              )}
            </div>
          </div>

          {/* Note + Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-slate-50 rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium mb-0.5">Ghi chú</p>
                <p className="text-sm text-slate-700 leading-relaxed">{inspection.note || "—"}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Ngày tạo</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(inspection.createdAt)}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Cập nhật</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(inspection.updatedAt)}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
          >
            Đóng
          </button>
        </div>
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
      .then((data) =>
        setInspections(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.data)
                ? data.data
                : [],
        ),
      )
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
          { label: "Mới tạo", value: statusCounts.CREATED ?? 0, color: "text-slate-600" },
          { label: "Hoàn thành", value: statusCounts.DONE ?? 0, color: "text-green-600" },
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
          <div className="grid grid-cols-[40px_2fr_100px_120px_110px_80px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {["STT", "Ghi chú", "Loại", "Ngày tạo", "Trạng thái", "Thao tác"].map((h) => (
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
            const tp = item.type ? (TYPE_CONFIG[item.type] ?? { label: item.type, bg: "bg-slate-50", text: "text-slate-600" }) : null;
            return (
              <div
                key={item.id}
                className="grid grid-cols-[40px_2fr_100px_120px_110px_80px] gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition items-center"
              >
                <p className="text-xs font-semibold text-slate-400">{index + 1}</p>
                <p className="text-xs text-slate-600 truncate" title={item.note}>
                  {item.note || "—"}
                </p>
                {tp ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold w-fit ${tp.bg} ${tp.text}`}>
                    {tp.label}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
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
