import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ClipboardCheck, Eye, Plus, MapPin, User, Calendar, FileText, Tag, X, Phone } from "lucide-react";
import { getInspections } from "../api/maintenance.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import CreateInspectionModal from "../components/CreateInspectionModal";

const STATUS_CONFIG = {
  CREATED:     { bg: "rgba(90,122,110,0.08)",  color: "#5A7A6E", dot: "#5A7A6E" },
  SCHEDULED:   { bg: "rgba(32,150,216,0.10)",  color: "#2096d8", dot: "#2096d8" },
  IN_PROGRESS: { bg: "rgba(59,181,130,0.10)",  color: "#3bb582", dot: "#3bb582" },
  DONE:        { bg: "rgba(59,181,130,0.10)",  color: "#3bb582", dot: "#3bb582" },
  APPROVED:    { bg: "rgba(32,150,216,0.10)",  color: "#2096d8", dot: "#2096d8" },
  CANCELLED:   { bg: "rgba(217,95,75,0.10)",   color: "#D95F4B", dot: "#D95F4B" },
};

const STATUS_FILTER_VALUES = ["", "CREATED", "SCHEDULED", "IN_PROGRESS", "DONE", "APPROVED", "CANCELLED"];

const TYPE_CONFIG = {
  CHECK_IN:  { label: "Check-in",  bg: "rgba(59,181,130,0.10)", color: "#3bb582" },
  CHECK_OUT: { label: "Check-out", bg: "rgba(217,95,75,0.08)",  color: "#D95F4B" },
};


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

function DetailModal({ inspection, onClose, t }) {
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
  const st = STATUS_CONFIG[inspection.status] ?? { bg: "#EAF4F0", color: "#5A7A6E", dot: "#5A7A6E" };
  const stLabel = t(`inspection.status.${inspection.status}`, { defaultValue: inspection.status });
  const tp = inspection.type ? (TYPE_CONFIG[inspection.type] ?? null) : null;
  const tpLabel = inspection.type ? t(`inspection.type.${inspection.type}`, { defaultValue: inspection.type }) : null;

  const houseName = house?.name ?? house?.houseName ?? null;
  const houseAddress = fetching ? null : ([house?.address, house?.ward, house?.city].filter(Boolean).join(", ") || null);
  const staffName = staff?.fullName ?? staff?.name ?? null;
  const staffPhone = staff?.phoneNumber ?? null;
  const staffEmail = staff?.email ?? null;
  const staffRole = staff?.roles?.[0] ?? null;
  const staffInitial = staffName ? staffName.trim().split(" ").pop()[0].toUpperCase() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(30,45,40,0.75)" }}>
      <div className="rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ background: "#FFFFFF" }}>

        {/* Banner */}
        <div className="relative h-28 px-6 pt-5" style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-xs font-medium mb-1">{t("inspection.detailTitle")}</p>
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
              {stLabel}
            </span>
            {tp && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md" style={{ background: tp.bg, color: tp.color, border: "1px solid rgba(255,255,255,0.6)" }}>
                {tpLabel}
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
              <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>{t("inspection.houseInfo")}</p>
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
              <p className="text-xs font-medium mb-1" style={{ color: "#5A7A6E" }}>{t("inspection.staffInfo")}</p>
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
                <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("inspection.staffNone")}</p>
              )}
            </div>
          </div>

          {/* Note + Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div className="min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>{t("inspection.noteLabel")}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#1E2D28" }}>{inspection.note || "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>{t("inspection.createdAt")}</p>
                <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{formatDate(inspection.createdAt)}</p>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-start gap-2.5" style={{ background: "#ffffff", border: "1px solid #C4DED5" }}>
              <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5A7A6E" }} />
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#5A7A6E" }}>{t("inspection.updatedAt")}</p>
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
            {t("actions.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: "CHECK_IN",  labelKey: "inspection.type.CHECK_IN",  color: "#3bb582", bg: "rgba(59,181,130,0.10)" },
  { key: "CHECK_OUT", labelKey: "inspection.type.CHECK_OUT", color: "#D95F4B", bg: "rgba(217,95,75,0.08)" },
];

export default function InspectionsPage() {
  const { t } = useTranslation("common");
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("CHECK_IN");
  const [slideDir, setSlideDir] = useState("right");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const navigate = useNavigate();

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    const newIdx = TABS.findIndex((t) => t.key === key);
    const oldIdx = TABS.findIndex((t) => t.key === activeTab);
    setSlideDir(newIdx > oldIdx ? "right" : "left");
    setActiveTab(key);
  };

  const fetchInspections = (status = filterStatus, type = activeTab) => {
    setLoading(true);
    setError(null);
    getInspections({ status: status || undefined, type })
      .then((data) =>
        setInspections(
          Array.isArray(data) ? data : (data?.items ?? data?.data ?? []),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInspections(filterStatus, activeTab); }, [activeTab, filterStatus]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>{t("inspection.pageTitle")}</h2>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => fetchInspections()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#ffffff" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            {t("actions.refresh")}
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
            {t("inspection.createBtn")}
          </button>
        </div>
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
      >
        {/* Row 1 — Type tabs */}
        <div className="flex items-center gap-0 px-5 pt-4 pb-0" style={{ borderBottom: "1px solid #C4DED5" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = activeTab === tab.key ? inspections.length : null;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={isActive
                  ? { color: tab.color, borderBottom: "2px solid " + tab.color, marginBottom: "-1px", paddingBottom: "calc(0.625rem + 1px)" }
                  : { color: "#9CA3AF", borderBottom: "2px solid transparent", marginBottom: "-1px" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#5A7A6E"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#9CA3AF"; }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tab.color }} />
                {t(tab.labelKey)}
                {isActive && !loading && count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: tab.bg, color: tab.color }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2 — Status filter */}
        <div className="flex items-center gap-1 px-5 py-2 overflow-x-auto" style={{ borderBottom: "1px solid #C4DED5", background: "#F7FBF9" }}>
          {STATUS_FILTER_VALUES.map((v) => {
            const isActive = filterStatus === v;
            const cfg = v ? STATUS_CONFIG[v] : null;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setFilterStatus(v)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={isActive
                  ? { background: cfg ? cfg.bg : "#EAF4F0", color: cfg ? cfg.color : "#3bb582", border: "1.5px solid " + (cfg ? cfg.color : "#3bb582") }
                  : { background: "transparent", color: "#5A7A6E", border: "1.5px solid transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#EAF4F0"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {cfg && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
                {v ? t(`inspection.status.${v}`, { defaultValue: v }) : t("inspection.filterAll")}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div key={activeTab} className={slideDir === "right" ? "slide-from-right" : "slide-from-left"}>

        {/* Loading */}
        {loading && (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-5" style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}>
                <div className="w-6 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="flex-1 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-20 h-5 rounded-full animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-24 h-3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="w-20 h-6 rounded-full animate-pulse" style={{ background: "#EAF4F0" }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
            <button type="button" onClick={fetchInspections} className="text-xs font-semibold underline" style={{ color: "#D95F4B" }}>
              {t("actions.retry")}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && inspections.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <ClipboardCheck className="w-7 h-7" style={{ color: "#3bb582" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#1E2D28" }}>{t("inspection.emptyTitle")}</p>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>
              {activeTab === "CHECK_IN" ? t("inspection.emptyCheckin") : t("inspection.emptyCheckout")}
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && inspections.length > 0 && (
          <div>
            {/* Table header */}
            <div
              className="grid gap-4 px-6 py-2.5"
              style={{ gridTemplateColumns: "44px 1fr 140px 160px 130px", borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}
            >
              {["#", t("inspection.colNote"), t("inspection.colType"), t("inspection.colCompletedAt"), t("inspection.colAction")].map((h) => (
                <p key={h} className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#5A7A6E" }}>{h}</p>
              ))}
            </div>

            {inspections.map((item, idx) => {
              const tp = TYPE_CONFIG[item.type] ?? { bg: "#EAF4F0", color: "#5A7A6E" };
              const st = STATUS_CONFIG[item.status] ?? { bg: "#EAF4F0", color: "#5A7A6E", dot: "#5A7A6E" };
              return (
                <div
                  key={item.id}
                  className="grid gap-4 px-6 py-4 transition-colors items-center group"
                  style={{ gridTemplateColumns: "44px 1fr 140px 160px 130px", borderBottom: "1px solid rgba(196,222,213,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F5FDF9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* No. */}
                  <span className="text-xs font-mono font-bold" style={{ color: "#D1D5DB" }}>{String(idx + 1).padStart(2, "0")}</span>

                  {/* Note + status badge */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#1E2D28" }}>{item.note || "—"}</p>
                    <span
                      className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: st.bg, color: st.color }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: st.dot }} />
                      {t(`inspection.status.${item.status}`, { defaultValue: item.status })}
                    </span>
                  </div>

                  {/* Type */}
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                    style={{ background: tp.bg, color: tp.color }}
                  >
                    {t(`inspection.type.${item.type}`, { defaultValue: item.type })}
                  </span>

                  {/* Date */}
                  <p className="text-sm" style={{ color: "#5A7A6E" }}>{formatDate(item.completedAt ?? item.updatedAt)}</p>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => navigate(`/maintenance/inspections/${item.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition w-fit"
                    style={{ background: "rgba(59,181,130,0.10)", color: "#3bb582", border: "1px solid rgba(59,181,130,0.2)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#3bb582"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,181,130,0.10)"; e.currentTarget.style.color = "#3bb582"; }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t("inspection.viewResult")}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        </div>{/* end slide wrapper */}
      </div>{/* end main card */}

      <CreateInspectionModal
        open={showCreate}
        type={activeTab}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchInspections(); }}
      />
    </div>
  );
}
