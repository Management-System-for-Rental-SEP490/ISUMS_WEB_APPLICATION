import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Search, X, Info, ExternalLink } from "lucide-react";
import { useHouses } from "../../houses/hooks/useHouses";
import HouseDetailModal from "../../houses/components/HouseDetailModal";
import { createInspection } from "../api/maintenance.api";

export default function CreateInspectionModal({ open, onClose, onCreated }) {
  const { t } = useTranslation("common");
  const { houses, loading: housesLoading } = useHouses();
  const [search, setSearch] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [detailHouse, setDetailHouse] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const filtered = houses.filter((h) =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedHouse) return;
    setSubmitting(true);
    setError(null);
    try {
      await createInspection({ houseId: selectedHouse.id, note });
      handleClose();
      onCreated?.();
    } catch (e) {
      setError(e?.message ?? t("inspection.approveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearch("");
    setSelectedHouse(null);
    setNote("");
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t("inspection.createModal.title")}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t("inspection.createModal.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* House picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                {t("inspection.createModal.houseLabel")} <span className="text-red-500">*</span>
              </label>

              {/* Search */}
              <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10 transition mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={t("inspection.createModal.housePlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs w-full text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* House list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {housesLoading ? (
                  <div className="space-y-0">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="px-3 py-3 border-b border-slate-100 last:border-0 flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                          <div className="h-2.5 w-1/2 bg-slate-100 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                    <p className="text-xs text-slate-400">{t("inspection.createModal.houseNotFound")}</p>
                  </div>
                ) : (
                  filtered.map((house) => {
                    const isSelected = selectedHouse?.id === house.id;
                    return (
                      <div
                        key={house.id}
                        className={[
                          "flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition group",
                          isSelected ? "bg-teal-50 border-teal-100" : "hover:bg-slate-50",
                        ].join(" ")}
                        onClick={() => setSelectedHouse(house)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {house.imageUrl ? (
                            <img src={house.imageUrl} alt={house.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? "text-teal-700" : "text-slate-800"}`}>
                            {house.name || "—"}
                          </p>
                          {house.address && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{house.address}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDetailHouse(house); }}
                          className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition opacity-0 group-hover:opacity-100"
                          title={t("inspection.createModal.viewDetail")}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected summary */}
              {selectedHouse && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <p className="text-xs text-teal-700 font-medium flex-1 truncate">
                    {t("inspection.createModal.houseSelected")} <span className="font-bold">{selectedHouse.name}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setDetailHouse(selectedHouse)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline transition shrink-0"
                  >
                    {t("inspection.createModal.viewDetail")}
                  </button>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                {t("inspection.createModal.noteLabel")}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("inspection.createModal.notePlaceholder")}
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl px-3 py-2.5 outline-none resize-none placeholder-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedHouse || submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
