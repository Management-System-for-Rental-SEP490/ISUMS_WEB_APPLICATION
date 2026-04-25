import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, Building2, MapPin } from "lucide-react";
import { getAllHouses } from "../../houses/api/houses.api";
import { addHousesToPlan } from "../api/maintenance.api";
import { toast } from "react-toastify";

export default function AddHousesModal({ open, planId, existingHouseIds = [], onClose, onAdded, t }) {
  const [mounted, setMounted]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [houses, setHouses]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(new Set());
  const [search, setSearch]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setSelected(new Set());
      setSearch("");
      setError(null);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      setLoading(true);
      getAllHouses({ page: 1, size: 100 })
        .then((data) => {
          const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
          setHouses(list);
        })
        .catch((err) => {
          setHouses([]);
          setError(err?.message ?? t("maintenance.addHousesErrorLoad"));
        })
        .finally(() => setLoading(false));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await addHousesToPlan(planId, [...selected]);
      onAdded?.();
      toast.success(t("maintenance.addHousesSuccess"), { autoClose: 3000, hideProgressBar: true, closeOnClick: true });
      handleClose();
    } catch (e) {
      setError(e.message ?? t("maintenance.addHousesErrorGeneral"));
    } finally {
      setSubmitting(false);
    }
  };

  const existingSet = new Set(existingHouseIds);
  const filtered = houses.filter((h) => {
    const q = search.toLowerCase();
    return (
      (h.name ?? h.title ?? "").toLowerCase().includes(q) ||
      (h.address ?? "").toLowerCase().includes(q)
    );
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(3px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          maxHeight: "85vh",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity 300ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3 flex-shrink-0">
          <div>
            <h3 className="text-[17px] font-bold text-slate-800">{t("maintenance.addHousesTitle")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t("maintenance.addHousesDesc")}</p>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10 transition">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("maintenance.addHousesSearchPlaceholder")}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">{t("maintenance.addHousesEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((house) => {
                const alreadyAdded = existingSet.has(house.id);
                const isSelected   = selected.has(house.id);
                return (
                  <button
                    key={house.id}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => toggle(house.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                      alreadyAdded
                        ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-50"
                        : isSelected
                          ? "border-teal-400 bg-teal-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-teal-100" : "bg-slate-100"}`}>
                      <Building2 className={`w-4 h-4 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-teal-700" : "text-slate-700"}`}>
                        {house.name ?? house.title ?? "—"}
                      </p>
                      {house.address && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {house.address}
                        </p>
                      )}
                    </div>
                    {alreadyAdded ? (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        {t("maintenance.addHousesAlreadyAdded")}
                      </span>
                    ) : isSelected ? (
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-2 flex-shrink-0">
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={handleClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
            {t("maintenance.addHousesBtnCancel")}
          </button>
          <button type="button" onClick={handleSubmit} disabled={selected.size === 0 || submitting}
            className="flex-[2] py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting
              ? t("maintenance.addHousesBtnSubmitting")
              : selected.size > 0
                ? t("maintenance.addHousesBtnSubmit", { count: selected.size })
                : t("maintenance.addHousesBtnSubmitEmpty")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
