import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ClipboardCheck, Eye, Plus, MapPin, User, Calendar, FileText, Tag, X, Phone } from "lucide-react";
import { getInspections } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import CreateInspectionModal from "../components/CreateInspectionModal";


const STATUS_CONFIG = {
  CREATED:     { label: "Mới tạo",          bg: "rgba(90,122,110,0.08)",  color: "#5A7A6E", dot: "#5A7A6E" },
  SCHEDULED:   { label: "Đã lên lịch",      bg: "rgba(32,150,216,0.10)",  color: "#2096d8", dot: "#2096d8" },
  IN_PROGRESS: { label: "Đang tiến hành",   bg: "rgba(59,181,130,0.10)",  color: "#3bb582", dot: "#3bb582" },
  DONE:        { label: "Hoàn thành",        bg: "rgba(59,181,130,0.10)",  color: "#3bb582", dot: "#3bb582" },
  CANCELLED:   { label: "Đã hủy",           bg: "rgba(217,95,75,0.10)",   color: "#D95F4B", dot: "#D95F4B" },
};

const TYPE_CONFIG = {
  CHECK_IN:  { label: "Check-in",  bg: "rgba(59,181,130,0.10)", color: "#3bb582" },
  CHECK_OUT: { label: "Check-out", bg: "rgba(217,95,75,0.08)",  color: "#D95F4B" },
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
  const st = STATUS_CONFIG[inspection.status] ?? { label: inspection.status, bg: "#EAF4F0", color: "#5A7A6E", dot: "#5A7A6E" };
  const tp = inspection.type ? (TYPE_CONFIG[inspection.type] ?? { label: inspection.type, bg: "#EAF4F0", color: "#5A7A6E" }) : null;

  const houseName = house?.name ?? house?.houseName ?? null;
  const houseAddress = fetching ? null : ([house?.address, house?.ward, house?.city].filter(Boolean).join(", ") || null);
  const staffName = staff?.fullName ?? staff?.name ?? null;
  const staffPhone = staff?.phoneNumber ?? null;
  const staffEmail = staff?.email ?? null;
  const staffRole = staff?.roles?.[0] ?? null;
  const staffInitial = staffName ? staffName.trim().split(" ").pop()[0].toUpperCase() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(30,45,40,0.75)" }}>
      <div className="rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ background: "#FAFFFE" }}>

        {/* Banner */}
        <div className="relative h-28 px-6 pt-5" style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md" style={{ background: st.bg, color: st.color, border: "1px solid rgba(255,255,255,0.6)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
              {st.label}
            </span>
            {tp && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md" style={{ background: tp.bg, color: tp.color, border: "1px solid rgba(255,255,255,0.6)" }}>
                {tp.label}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-8 pb-6 space-y-4">

          {/* House card */}
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAF4F0" }}>
              <MapPin className="w-4 h-4" style={{ color: "#3bb582" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>Thông tin nhà</p>
              {fetching ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-36 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>{houseName ?? "—"}</p>
                  {houseAddress && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#5A7A6E" }}>{houseAddress}</p>}
                </>
              )}
            </div>
          </div>

          {/* Staff card */}
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
            {fetching ? (
              <div className="w-10 h-10 rounded-xl animate-pulse flex-shrink-0" style={{ background: "#EAF4F0" }} />
            ) : staffInitial ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(32,150,216,0.12)" }}>
                <span className="text-sm font-bold" style={{ color: "#2096d8" }}>{staffInitial}</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAF4F0" }}>
                <User className="w-4 h-4" style={{ color: "#5A7A6E" }} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium mb-1" style={{ color: "#5A7A6E" }}>Nhân viên phụ trách</p>
              {fetching ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                  <div className="h-3 w-24 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                </div>
              ) : staffName ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{staffName}</p>
                  {staffPhone && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "#5A7A6E" }}>
                      <Phone className="w-3 h-3" style={{ color: "#5A7A6E" }} />
                      <a href={`tel:${staffPhone}`} className="transition" style={{ color: "#5A7A6E" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#3bb582"}
                        onMouseLeave={e => e.currentTarget.style.color = "#5A7A6E"}
                      >{staffPhone}</a>
                    </p>
                  )}
                  {staffEmail && <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{staffEmail}</p>}
                  {staffRole && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5" style={{ background: "rgba(32,150,216,0.10)", color: "#2096d8" }}>
                      {staffRole}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#5A7A6E" }}>Chưa phân công</p>
              )}
            </div>
          </div>

          {/* Note + Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div className="min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>Ghi chú</p>
                <p className="text-sm leading-relaxed" style={{ color: "#1E2D28" }}>{inspection.note || "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>Ngày tạo</p>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{formatDate(inspection.createdAt)}</p>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>Cập nhật</p>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{formatDate(inspection.updatedAt)}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-sm font-semibold transition"
            style={{ background: "#EAF4F0", color: "#5A7A6E" }}
            onMouseEnter={e => e.currentTarget.style.background = "#C4DED5"}
            onMouseLeave={e => e.currentTarget.style.background = "#EAF4F0"}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: "CHECK_IN",  label: "Check-in",  color: "#3bb582", bg: "rgba(59,181,130,0.10)" },
  { key: "CHECK_OUT", label: "Check-out", color: "#D95F4B", bg: "rgba(217,95,75,0.08)" },
];

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("CHECK_IN");
  const [slideDir, setSlideDir] = useState("right"); // "right" | "left"
  const navigate = useNavigate();

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    const newIdx = TABS.findIndex((t) => t.key === key);
    const oldIdx = TABS.findIndex((t) => t.key === activeTab);
    setSlideDir(newIdx > oldIdx ? "right" : "left");
    setActiveTab(key);
  };

  const fetchInspections = () => {
    setLoading(true);
    setError(null);
    getInspections({ status: "DONE", type: activeTab })
      .then((data) =>
        setInspections(
          Array.isArray(data) ? data : (data?.items ?? data?.data ?? []),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInspections(); }, [activeTab]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <ClipboardCheck className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3bb582" }}>Kiểm tra</span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>Kết quả bàn giao</h2>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={fetchInspections}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-full shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Plus className="w-4 h-4" />
            Tạo kiểm tra
          </button>
        </div>
      </div>

      {/* Tabs — sliding indicator */}
      <div className="relative flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ background: "#EAF4F0" }}>
        {/* Sliding pill */}
        <div
          className="absolute top-1 bottom-1 rounded-xl transition-transform duration-250 ease-in-out"
          style={{
            width: "calc(50% - 4px)",
            left: 4,
            background: "#ffffff",
            boxShadow: "0 1px 4px rgba(59,181,130,0.14)",
            transform: `translateX(${activeTab === TABS[0].key ? "0%" : "calc(100% + 4px)"})`,
          }}
        />
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className="relative z-10 px-5 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 min-w-[110px]"
              style={{ color: isActive ? tab.color : "#5A7A6E" }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content — key triggers remount + slide animation on tab change */}
      <div key={activeTab} className={slideDir === "right" ? "slide-from-right" : "slide-from-left"}>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}>
              <div className="w-20 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="w-28 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="flex-1 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              <div className="w-20 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
          <button type="button" onClick={fetchInspections} className="mt-3 text-xs font-semibold underline" style={{ color: "#D95F4B" }}>
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && inspections.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FAFFFE", border: "1px solid #C4DED5" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EAF4F0" }}>
            <ClipboardCheck className="w-7 h-7" style={{ color: "#3bb582" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>Chưa có kết quả kiểm tra nào</p>
          <p className="text-xs mt-1" style={{ color: "#5A7A6E" }}>
            Chưa có kết quả kiểm tra {activeTab === "CHECK_IN" ? "Check-in" : "Check-out"} nào hoàn thành
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && inspections.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FAFFFE", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
          <div className="grid grid-cols-[2fr_130px_170px_140px] gap-4 px-5 py-3" style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
            {["Ghi chú", "Loại", "Hoàn thành lúc", "Thao tác"].map((h) => (
              <p key={h} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{h}</p>
            ))}
          </div>
          {inspections.map((item) => {
            const tp = TYPE_CONFIG[item.type] ?? { label: item.type, bg: "#EAF4F0", color: "#5A7A6E" };
            return (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_130px_170px_140px] gap-4 px-5 py-3.5 transition items-center"
                style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{item.note || "—"}</p>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit"
                  style={{ background: tp.bg, color: tp.color }}
                >
                  {tp.label}
                </span>
                <p className="text-xs" style={{ color: "#5A7A6E" }}>{formatDate(item.completedAt ?? item.updatedAt)}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/maintenance/inspections/${item.id}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition w-fit"
                  style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(59,181,130,0.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(59,181,130,0.10)"}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem kết quả
                </button>
              </div>
            );
          })}
        </div>
      )}

      </div>{/* end slide wrapper */}

      <CreateInspectionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchInspections(); }}
      />
    </div>
  );
}
