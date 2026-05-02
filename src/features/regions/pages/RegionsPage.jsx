import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MapPin, Plus, X, Users, Building2, RefreshCw, Check, Search } from "lucide-react";
import { getRegions, createRegion, assignStaffToRegion, getHousesByRegion } from "../../houses/api/houses.api";
import { getStaffs } from "../../tenants/api/users.api";
import { LoadingSpinner } from "../../../components/shared/Loading";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name = "" }) {
  const initials = name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
      {initials || "?"}
    </div>
  );
}

// ── Create Region Modal ───────────────────────────────────────────────────────
function CreateRegionModal({ onClose, onCreated }) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 250); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t("regions.validationName")); return; }
    setSubmitting(true);
    try {
      await createRegion({ name: form.name.trim(), description: form.description.trim(), technicalStaffIds: [] });
      toast.success(t("regions.createSuccess", { name: form.name.trim() }));
      onCreated();
      handleClose();
    } catch (err) {
      toast.error(err.message || t("regions.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 250ms ease" }}
      onClick={handleClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #C4DED5", boxShadow: "0 20px 60px -10px rgba(59,181,130,0.20)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          opacity: visible ? 1 : 0, transition: "transform 250ms cubic-bezier(0.34,1.2,0.64,1), opacity 250ms ease" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,181,130,0.12)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#3bb582" }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#1E2D28" }}>{t("regions.modalTitle")}</h3>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-lg transition"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <X className="w-4 h-4" style={{ color: "#5A7A6E" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
              {t("regions.fieldName")} <span style={{ color: "#D95F4B" }}>*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t("regions.fieldNamePlaceholder")}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition"
              style={{ border: "1px solid #C4DED5", color: "#1E2D28", background: "#fff" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
              {t("regions.fieldDesc")}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={t("regions.fieldDescPlaceholder")}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition resize-none"
              style={{ border: "1px solid #C4DED5", color: "#1E2D28", background: "#fff" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#3bb582"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,181,130,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#C4DED5"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {t("regions.cancel")}
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
              {submitting ? t("regions.creating") : t("regions.create")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ── Region Detail Drawer ──────────────────────────────────────────────────────
function RegionDetailDrawer({ region, allStaff, onClose, onAssigned }) {
  const { t } = useTranslation("common");
  const [tab, setTab] = useState("staff");
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState(null);
  const [visible, setVisible] = useState(false);
  const [regionHouses, setRegionHouses] = useState([]);
  const [housesLoading, setHousesLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  useEffect(() => {
    setHousesLoading(true);
    getHousesByRegion(region.id)
      .then(setRegionHouses)
      .catch(() => setRegionHouses([]))
      .finally(() => setHousesLoading(false));
  }, [region.id]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const assignedIds = new Set(region.staffIds ?? []);

  const filteredStaff = allStaff.filter(
    (s) => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (staffId) => {
    if (assignedIds.has(staffId)) return;
    setAssigning(staffId);
    try {
      await assignStaffToRegion(region.id, staffId);
      toast.success(t("regions.assignSuccess"));
      onAssigned();
    } catch (err) {
      toast.error(err.message || t("regions.assignError"));
    } finally {
      setAssigning(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1050] flex justify-end"
      style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)", opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      onClick={handleClose}>
      <div className="h-full w-full max-w-lg flex flex-col bg-white shadow-2xl"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 300ms cubic-bezier(0.34,1.2,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #C4DED5" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,181,130,0.12)" }}>
                <MapPin className="w-5 h-5" style={{ color: "#3bb582" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#1E2D28" }}>{region.name}</h3>
                {region.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#5A7A6E" }}>{region.description}</p>
                )}
              </div>
            </div>
            <button type="button" onClick={handleClose} className="p-1.5 rounded-lg transition flex-shrink-0"
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <X className="w-4 h-4" style={{ color: "#5A7A6E" }} />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-4">
            {[
              { icon: Building2, value: regionHouses.length, label: t("regions.houses") },
              { icon: Users,     value: (region.staffIds ?? []).length, label: t("regions.staffCount") },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
                style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}>
                <Icon className="w-4 h-4" style={{ color: "#3bb582" }} />
                <span className="text-lg font-bold" style={{ color: "#1E2D28" }}>{value}</span>
                <span className="text-xs" style={{ color: "#5A7A6E" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 p-1 rounded-xl" style={{ background: "#EAF4F0" }}>
            {[
              { key: "staff",  label: t("regions.tabStaff"),  icon: Users },
              { key: "houses", label: t("regions.tabHouses"), icon: Building2 },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition"
                style={tab === key
                  ? { background: "#fff", color: "#1E2D28", boxShadow: "0 1px 4px rgba(59,181,130,0.15)" }
                  : { color: "#5A7A6E" }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "staff" && (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5A7A6E" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("regions.searchStaff")}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition"
                  style={{ background: "#EAF4F0", border: "1px solid #C4DED5", color: "#1E2D28" }}
                  onFocus={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#3bb582"; }}
                  onBlur={(e) => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.borderColor = "#C4DED5"; }}
                />
              </div>

              {filteredStaff.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "#5A7A6E" }}>{t("regions.noStaff")}</p>
              ) : (
                filteredStaff.map((staff) => {
                  const isAssigned = assignedIds.has(staff.id);
                  const isLoading  = assigning === staff.id;
                  return (
                    <div key={staff.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition"
                      style={{ border: `1px solid ${isAssigned ? "#3bb582" : "#C4DED5"}`, background: isAssigned ? "rgba(59,181,130,0.04)" : "#fff" }}>
                      <Avatar name={staff.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>{staff.name}</p>
                        <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{staff.email}</p>
                      </div>
                      {isAssigned ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "rgba(59,181,130,0.12)", color: "#3bb582" }}>
                          <Check className="w-3 h-3" />{t("regions.assigned")}
                        </span>
                      ) : (
                        <button type="button" disabled={isLoading} onClick={() => handleAssign(staff.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}>
                          {isLoading ? "..." : t("regions.assign")}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "houses" && (
            <div className="space-y-2">
              {housesLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse" style={{ border: "1px solid #C4DED5", background: "#fff" }}>
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: "#EAF4F0" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded-full w-2/5" style={{ background: "#E2EAE6" }} />
                      <div className="h-2.5 rounded-full w-3/5" style={{ background: "#EAF4F0" }} />
                    </div>
                    <div className="h-5 w-14 rounded-full" style={{ background: "#EAF4F0" }} />
                  </div>
                ))
              ) : regionHouses.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "#5A7A6E" }}>{t("regions.noHouses")}</p>
              ) : (
                regionHouses.map((house) => (
                  <div key={house.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ border: "1px solid #C4DED5", background: "#fff" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EAF4F0" }}>
                      <Building2 className="w-4 h-4" style={{ color: "#3bb582" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>{house.name}</p>
                      <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{house.address}</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: house.status === "RENTED" ? "rgba(32,150,216,0.1)" : "rgba(59,181,130,0.1)",
                        color: house.status === "RENTED" ? "#2096d8" : "#3bb582" }}>
                      {t(`houses.status.${house.status}`, { defaultValue: house.status })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Region Card ───────────────────────────────────────────────────────────────
function RegionCard({ region, houseCount, onClick }) {
  const { t } = useTranslation("common");
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 group"
      style={{ background: "#fff", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.06)" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px -4px rgba(59,181,130,0.18)"; e.currentTarget.style.borderColor = "#3bb582"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(59,181,130,0.06)"; e.currentTarget.style.borderColor = "#C4DED5"; }}>

      {/* Icon + Name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: "rgba(59,181,130,0.12)" }}>
          <MapPin className="w-5 h-5" style={{ color: "#3bb582" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base leading-snug truncate" style={{ color: "#1E2D28" }}>{region.name}</h3>
          {region.description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#5A7A6E" }}>{region.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl" style={{ background: "#EAF4F0" }}>
          <Building2 className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
          <span className="text-sm font-bold" style={{ color: "#1E2D28" }}>{houseCount}</span>
          <span className="text-xs" style={{ color: "#5A7A6E" }}>{t("regions.houses")}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl" style={{ background: "#EAF4F0" }}>
          <Users className="w-3.5 h-3.5" style={{ color: "#2096d8" }} />
          <span className="text-sm font-bold" style={{ color: "#1E2D28" }}>{(region.staffIds ?? []).length}</span>
          <span className="text-xs" style={{ color: "#5A7A6E" }}>{t("regions.staffCount")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RegionsPage() {
  const { t } = useTranslation("common");
  const [regions,        setRegions]        = useState([]);
  const [allStaff,       setAllStaff]       = useState([]);
  const [houseCountMap,  setHouseCountMap]  = useState({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [activeRegion,   setActiveRegion]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsData, staffData] = await Promise.all([
        getRegions(),
        getStaffs(),
      ]);
      const regionList = Array.isArray(regionsData) ? regionsData : [];
      setRegions(regionList);
      setAllStaff(Array.isArray(staffData) ? staffData : []);

      const counts = await Promise.all(
        regionList.map((r) => getHousesByRegion(r.id).then((h) => [r.id, h.length]).catch(() => [r.id, 0]))
      );
      setHouseCountMap(Object.fromEntries(counts));
    } catch (err) {
      setError(err.message || t("regions.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeRegionData = regions.find((r) => r.id === activeRegion?.id) ?? activeRegion;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>{t("regions.title")}</h2>
          <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>{t("regions.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button type="button" onClick={fetchAll} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAF4F0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#3bb582" }} />
            {t("regions.refresh")}
          </button>
          <button type="button" onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-full text-sm font-semibold shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <Plus className="w-4 h-4" />
            {t("regions.addNew")}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#fff", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm font-semibold flex-1" style={{ color: "#D95F4B" }}>{error}</p>
          <button type="button" onClick={fetchAll} className="text-xs font-semibold underline" style={{ color: "#D95F4B" }}>
            {t("regions.retry")}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl py-16 flex justify-center" style={{ background: "#fff", border: "1px solid #C4DED5" }}>
          <LoadingSpinner size="lg" showLabel label={t("regions.title")} />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && regions.length === 0 && (
        <div className="rounded-2xl py-16 flex flex-col items-center gap-3 text-center"
          style={{ background: "#fff", border: "1px solid #C4DED5" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
            <MapPin className="w-7 h-7" style={{ color: "#3bb582" }} />
          </div>
          <p className="font-semibold" style={{ color: "#1E2D28" }}>{t("regions.empty")}</p>
          <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("regions.emptyHint")}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && regions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {regions.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              houseCount={houseCountMap[region.id] ?? "–"}
              onClick={() => setActiveRegion(region)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateRegionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchAll(); }}
        />
      )}

      {activeRegion && (
        <RegionDetailDrawer
          region={activeRegionData}
          allStaff={allStaff}
          onClose={() => setActiveRegion(null)}
          onAssigned={fetchAll}
        />
      )}
    </div>
  );
}
