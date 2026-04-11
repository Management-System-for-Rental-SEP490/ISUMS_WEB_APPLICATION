import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, Tag, Plus, X, Pencil, Check } from "lucide-react";
import { toast } from "react-toastify";
import { getBanners, createBanner, updateBannerPrice } from "../api/issues.api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

const EMPTY_FORM = { name: "", price: "", estimateCost: "" };

function CreateBannerModal({ open, onClose, onCreated }) {
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
    if (!form.name.trim() || !form.price || !form.estimateCost) return;
    setError(null);
    setSubmitting(true);
    try {
      await createBanner({
        name: form.name.trim(),
        price: Number(form.price),
        estimateCost: Number(form.estimateCost),
      });
      toast.success(`Đã thêm báo giá: ${form.name.trim()}`);
      onCreated();
      handleClose();
    } catch (e) {
      setError(e.message ?? "Tạo thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 250ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{
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
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Thêm báo giá mới
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Điền thông tin thiết bị / dịch vụ
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Tên dịch vụ / thiết bị <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="VD: Vệ sinh máy lạnh"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-400 transition placeholder-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Giá mua (đ) <span className="text-red-400">*</span>
              </label>
              <input
                name="estimatedCost"
                type="number"
                min="0"
                value={form.estimatedCost}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-400 transition placeholder-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Giá bán (đ) <span className="text-red-400">*</span>
              </label>
              <input
                name="currentPrice"
                type="number"
                min="0"
                value={form.currentPrice}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-400 transition placeholder-gray-300"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang tạo..." : "Tạo báo giá"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function EditPriceInline({ item, onUpdated }) {
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
      toast.success(`Đã cập nhật giá bán: ${item.name}`);
      setEditing(false);
      onUpdated();
    } catch (e) {
      toast.error(e.message ?? "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-teal-600">
          {formatCurrency(item.currentPrice)}
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
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
        className="w-28 border border-teal-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-teal-500"
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
        className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function IssuePriceListPage() {
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
      setError(e.message ?? "Không thể tải danh sách, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bảng giá thiết bị thay thế
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Giá tham khảo cho các dịch vụ sửa chữa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Thêm báo giá
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchBanners}
            className="text-xs text-red-600 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
          {["STT", "Tên dịch vụ / thiết bị", "Giá mua vào", "Giá bán"].map(
            (h) => (
              <p
                key={h}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
              >
                {h}
              </p>
            ),
          )}
        </div>

        {/* Skeleton */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-4 border-b border-gray-50 last:border-0 animate-pulse"
            >
              <div className="h-3 bg-gray-100 rounded w-6" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}

        {/* Empty */}
        {!loading && !error && banners.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Tag className="w-10 h-10 text-gray-200" />
            <p className="text-sm">Chưa có dữ liệu bảng giá</p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          banners.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[48px_minmax(0,1fr)_200px_220px] gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition items-center"
            >
              <p className="text-xs font-semibold text-gray-400">{index + 1}</p>
              <p
                className="text-sm font-medium text-gray-800 truncate"
                title={item.name}
              >
                {item.name}
              </p>
              <p className="text-sm font-semibold text-gray-600">
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
