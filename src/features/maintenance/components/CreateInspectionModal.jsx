import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Search, X, Info, ExternalLink, LogIn, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllHouses } from "../../houses/api/houses.api";
import { mapHouseToHouseCard } from "../../houses/utils/mapHouseToHouseCard";
import HouseDetailModal from "../../houses/components/HouseDetailModal";
import { createInspection } from "../api/maintenance.api";

const TYPE_CONFIG = {
  CHECK_IN:  { icon: LogIn,  color: "#3bb582", bg: "rgba(59,181,130,0.12)", border: "#3bb582" },
  CHECK_OUT: { icon: LogOut, color: "#D95F4B", bg: "rgba(217,95,75,0.10)",  border: "#D95F4B" },
};

const PAGE_SIZE = 8;

export default function CreateInspectionModal({ open, type: defaultType = "CHECK_IN", onClose, onCreated }) {
  const { t } = useTranslation("common");

  const [type, setType]                   = useState(defaultType);
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]                   = useState(1);
  const [houses, setHouses]               = useState([]);
  const [total, setTotal]                 = useState(0);
  const [housesLoading, setHousesLoading] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [detailHouse, setDetailHouse]     = useState(null);
  const [note, setNote]                   = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState(null);

  const debounceRef = useRef(null);

  // Debounce search input 400ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch houses when modal open / search / page changes
  useEffect(() => {
    if (!open) return;
    setHousesLoading(true);
    const params = { page, size: PAGE_SIZE };
    if (debouncedSearch) params.keyword = debouncedSearch;
    getAllHouses(params)
      .then((raw) => {
        const arr = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setHouses(arr.map((h) => mapHouseToHouseCard(h)));
        setTotal(raw?.total ?? arr.length);
      })
      .catch(() => { setHouses([]); setTotal(0); })
      .finally(() => setHousesLoading(false));
  }, [open, debouncedSearch, page]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      setSelectedHouse(null);
      setNote("");
      setError(null);
    }
  }, [open, defaultType]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSubmit = async () => {
    if (!selectedHouse) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInspection({ houseId: selectedHouse.id, type, note });
      onCreated?.();
      onClose();
    } catch (e) {
      setError(e?.message ?? t("inspection.approveError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const typeCfg = TYPE_CONFIG[type];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid #EAF4F0" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#1E2D28" }}>{t("inspection.createModal.title")}</h3>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{t("inspection.createModal.subtitle")}</p>
            </div>
            <button type="button" onClick={onClose}
              className="p-1.5 rounded-lg transition" style={{ color: "#9CA3AF" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Type toggle */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#5A7A6E" }}>
                {t("inspection.colType")} <span style={{ color: "#D95F4B" }}>*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = type === key;
                  return (
                    <button key={key} type="button" onClick={() => setType(key)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={isActive
                        ? { background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.border}` }
                        : { background: "#F7FBF9", color: "#5A7A6E", border: "2px solid #C4DED5" }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {t(`inspection.type.${key}`, { defaultValue: key })}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* House picker */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#5A7A6E" }}>
                {t("inspection.createModal.houseLabel")} <span style={{ color: "#D95F4B" }}>*</span>
              </label>

              {/* Search box */}
              <div className="flex items-center rounded-xl px-3 py-2 mb-2 transition"
                style={{ background: "#F7FBF9", border: "1px solid #C4DED5" }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "#3bb582"}
                onBlurCapture={e => e.currentTarget.style.borderColor = "#C4DED5"}
              >
                <Search className="w-3.5 h-3.5 mr-2 shrink-0" style={{ color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder={t("inspection.createModal.housePlaceholder")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs w-full"
                  style={{ color: "#1E2D28" }}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="ml-1 shrink-0" style={{ color: "#9CA3AF" }}>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* House list */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #C4DED5" }}>
                {housesLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="px-3 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #EAF4F0" }}>
                        <div className="w-8 h-8 rounded-lg animate-pulse shrink-0" style={{ background: "#EAF4F0" }} />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                          <div className="h-2.5 w-1/2 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                        </div>
                      </div>
                    ))}
                  </>
                ) : houses.length === 0 ? (
                  <div className="py-8 text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#C4DED5" }} />
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{t("inspection.createModal.houseNotFound")}</p>
                  </div>
                ) : (
                  houses.map((house) => {
                    const isSelected = selectedHouse?.id === house.id;
                    return (
                      <div key={house.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition group"
                        style={{ borderBottom: "1px solid #EAF4F0", background: isSelected ? "rgba(59,181,130,0.06)" : "transparent" }}
                        onClick={() => setSelectedHouse(house)}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F7FBF9"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? "rgba(59,181,130,0.06)" : "transparent"; }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                          style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}>
                          {house.imageUrl
                            ? <img src={house.imageUrl} alt={house.name} className="w-full h-full object-cover" />
                            : <Building2 className="w-4 h-4" style={{ color: "#5A7A6E" }} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: isSelected ? "#3bb582" : "#1E2D28" }}>
                            {house.name || "—"}
                          </p>
                          {house.address && (
                            <p className="text-[10px] truncate mt-0.5" style={{ color: "#9CA3AF" }}>{house.address}</p>
                          )}
                        </div>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setDetailHouse(house); }}
                          className="p-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                          style={{ color: "#9CA3AF" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#3bb582"; e.currentTarget.style.background = "#EAF4F0"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3bb582" }}>
                            <svg className="w-2.5 h-2.5" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPage(p => p - 1)} disabled={page === 1}
                      className="p-1 rounded-lg transition disabled:opacity-30"
                      style={{ color: "#5A7A6E" }}
                      onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = "#EAF4F0"; }}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold px-2" style={{ color: "#5A7A6E" }}>{page} / {totalPages}</span>
                    <button type="button" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                      className="p-1 rounded-lg transition disabled:opacity-30"
                      style={{ color: "#5A7A6E" }}
                      onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = "#EAF4F0"; }}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Selected summary */}
              {selectedHouse && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(59,181,130,0.06)", border: "1px solid #C4DED5" }}>
                  <Info className="w-3.5 h-3.5 shrink-0" style={{ color: "#3bb582" }} />
                  <p className="text-xs font-medium flex-1 truncate" style={{ color: "#1E2D28" }}>
                    {t("inspection.createModal.houseSelected")}{" "}
                    <span className="font-bold" style={{ color: "#3bb582" }}>{selectedHouse.name}</span>
                  </p>
                  <button type="button" onClick={() => setDetailHouse(selectedHouse)}
                    className="text-xs font-semibold underline shrink-0" style={{ color: "#3bb582" }}>
                    {t("inspection.createModal.viewDetail")}
                  </button>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#5A7A6E" }}>
                {t("inspection.createModal.noteLabel")}
              </label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder={t("inspection.createModal.notePlaceholder")}
                className="w-full text-sm border rounded-xl px-3 py-2.5 outline-none resize-none transition"
                style={{ border: "1px solid #C4DED5", color: "#1E2D28" }}
                onFocus={e => e.currentTarget.style.borderColor = "#3bb582"}
                onBlur={e => e.currentTarget.style.borderColor = "#C4DED5"}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.3)" }}>
                <p className="text-xs font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 shrink-0 flex items-center justify-end gap-2" style={{ borderTop: "1px solid #EAF4F0" }}>
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl transition disabled:opacity-50"
              style={{ color: "#5A7A6E", border: "1px solid #C4DED5", background: "#ffffff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#EAF4F0"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
            >
              {t("actions.cancel")}
            </button>
            <button type="button" onClick={handleSubmit} disabled={!selectedHouse || submitting}
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${typeCfg.color} 0%, #2096d8 100%)` }}
            >
              {submitting ? t("inspection.createModal.creating") : t("inspection.createModal.create")}
            </button>
          </div>
        </div>
      </div>

      {detailHouse && (
        <HouseDetailModal house={detailHouse} onClose={() => setDetailHouse(null)} />
      )}
    </>
  );
}
