import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { RefreshCw, Tag, Plus, X, Pencil, Check } from "lucide-react";
import { toast } from "react-toastify";
import { getBanners, createBanner, updateBannerPrice } from "../api/issues.api";

/**
 * Service price list page. Fully i18n'd (vi / en / ja) — sibling pages
 * in /features/issues/ already follow the same pattern (see
 * IssueListPage, IssueAssignmentPage), and the sidebar entry and route
 * title already read from `sidebar.priceList` / `routeTitles.priceList`,
 * so leaving this page hardcoded to Vietnamese created a jarring mix
 * of languages (EN breadcrumb + VN page header).
 *
 * Locale keys live under `issuePriceList.*` in every common.json.
 */

// VND is the canonical currency regardless of UI locale — rental
// prices in the ISUMS domain are always denominated in VND. The
// Intl formatter's locale only affects digit grouping / symbol
// placement; use `vi-VN` for consistency with the rest of the app
// (tenant-facing invoices, contract PDFs, etc.).
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Field names match what createBanner() sends on the wire.
// Previously the form state was {name, price, estimateCost} while the
// inputs were keyed `estimatedCost` / `currentPrice` — so typing in the
// two price fields never updated state, and the Create button submitted
// undefined. Aligning state + inputs + request shape here also.
const EMPTY_FORM = { name: "", estimatedCost: "", currentPrice: "" };

function CreateBannerModal({ open, onClose, onCreated }) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError(null);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.estimatedCost || !form.currentPrice) return;
    setError(null);
    setSubmitting(true);
    try {
      // Backend contract (see issues.api#createBanner): name + both
      // prices. Keep numeric coercion at the edge so the wire payload
      // is always plain numbers — avoids string/number type confusion
      // in the BE validator.
      await createBanner({
        name: form.name.trim(),
        estimatedCost: Number(form.estimatedCost),
        currentPrice: Number(form.currentPrice),
      });
      toast.success(t("issuePriceList.create.successToast", { name: form.name.trim() }));
      onCreated();
      handleClose();
    } catch (e) {
      setError(e.message ?? t("issuePriceList.create.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(30,45,40,0.75)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 250ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{
          background: "#FFFFFF",
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 250ms cubic-bezier(0.34,1.2,0.64,1), opacity 250ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #C4DED5" }}>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "#1E2D28" }}>
              {t("issuePriceList.create.title")}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#5A7A6E" }}>
              {t("issuePriceList.create.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full transition"
            style={{ color: "#5A7A6E" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
              {t("issuePriceList.create.nameLabel")} <span style={{ color: "#D95F4B" }}>*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("issuePriceList.create.namePlaceholder")}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition"
              style={{ border: "1px solid #C4DED5", color: "#1E2D28", background: "#ffffff" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
                {t("issuePriceList.create.costLabel")} <span style={{ color: "#D95F4B" }}>*</span>
              </label>
              <input
                name="estimatedCost"
                type="number"
                min="0"
                value={form.estimatedCost}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition"
                style={{ border: "1px solid #C4DED5", color: "#1E2D28", background: "#ffffff" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#5A7A6E" }}>
                {t("issuePriceList.create.sellLabel")} <span style={{ color: "#D95F4B" }}>*</span>
              </label>
              <input
                name="currentPrice"
                type="number"
                min="0"
                value={form.currentPrice}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition"
                style={{ border: "1px solid #C4DED5", color: "#1E2D28", background: "#ffffff" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#3bb582"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#C4DED5"; }}
                required
              />
            </div>
          </div>

          {error && <p className="text-xs" style={{ color: "#D95F4B" }}>{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition"
              style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {t("issuePriceList.create.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
            >
              {submitting ? t("issuePriceList.create.submitting") : t("issuePriceList.create.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function EditPriceInline({ item, onUpdated }) {
  const { t } = useTranslation("common");
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setPrice(String(item.currentPrice ?? ""));
    setEditing(true);
  };

  const handleSave = async () => {
    if (!price || isNaN(Number(price))) return;
    setSaving(true);
    try {
      await updateBannerPrice(item.id, Number(price));
      toast.success(t("issuePriceList.edit.successToast", { name: item.name }));
      setEditing(false);
      onUpdated();
    } catch (e) {
      toast.error(e.message ?? t("issuePriceList.edit.failed"));
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold" style={{ color: "#3bb582" }}>
          {formatCurrency(item.currentPrice)}
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className="p-1 rounded-lg transition"
          style={{ color: "#5A7A6E" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; e.currentTarget.style.color = "#1E2D28"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5A7A6E"; }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-28 rounded-lg px-2 py-1 text-sm outline-none"
        style={{ border: "1px solid #3bb582" }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="p-1.5 rounded-lg text-white transition disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg transition"
        style={{ color: "#5A7A6E" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function IssuePriceListPage() {
  const { t } = useTranslation("common");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message ?? t("issuePriceList.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Table column headers — key against the structured `table.*` block
  // so reordering / renaming stays localized without touching JSX.
  const tableHeaders = [
    t("issuePriceList.table.index"),
    t("issuePriceList.table.name"),
    t("issuePriceList.table.costPrice"),
    t("issuePriceList.table.sellPrice"),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: "#1E2D28" }}>
            {t("issuePriceList.title")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#FFFFFF" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EAF4F0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("issuePriceList.refresh")}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm transition"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            <Plus className="w-4 h-4" />
            {t("issuePriceList.addBanner")}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(217,95,75,0.04)", border: "1px solid rgba(217,95,75,0.3)" }}>
          <p className="text-sm" style={{ color: "#D95F4B" }}>{error}</p>
          <button onClick={fetchBanners} className="text-xs underline" style={{ color: "#D95F4B" }}>
            {t("issuePriceList.retry")}
          </button>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}>
        {/* Table header */}
        <div className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-3" style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
          {tableHeaders.map((h) => (
            <p key={h} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>
              {h}
            </p>
          ))}
        </div>

        {/* Skeleton */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-4 animate-pulse"
              style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
            >
              <div className="h-3 rounded w-6" style={{ background: "#EAF4F0" }} />
              <div className="h-3 rounded w-3/4" style={{ background: "#EAF4F0" }} />
              <div className="h-3 rounded w-24" style={{ background: "#EAF4F0" }} />
              <div className="h-3 rounded w-24" style={{ background: "#EAF4F0" }} />
            </div>
          ))}

        {/* Empty */}
        {!loading && !error && banners.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EAF4F0" }}>
              <Tag className="w-7 h-7" style={{ color: "#3bb582" }} />
            </div>
            <p className="text-sm" style={{ color: "#5A7A6E" }}>{t("issuePriceList.empty")}</p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          banners.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-4 transition items-center"
              style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F0FAF6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <p className="text-xs font-semibold" style={{ color: "#5A7A6E" }}>{index + 1}</p>
              <p className="text-sm font-medium truncate" style={{ color: "#1E2D28" }} title={item.name}>
                {item.name}
              </p>
              <p className="text-sm font-semibold" style={{ color: "#5A7A6E" }}>
                {formatCurrency(item.estimatedCost)}
              </p>
              <EditPriceInline item={item} onUpdated={fetchBanners} />
            </div>
          ))}
      </div>

      <CreateBannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchBanners}
      />
    </div>
  );
}
