import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ChevronDown, MapPin } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { getHouseById, getHouseImages } from "../../../houses/api/houses.api";
import { AREA_TYPE_CONFIG } from "../../../houses/components/HouseDetailModal";

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const inputClass =
  "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-400 transition placeholder:text-slate-400";

const HOUSE_STATUS = {
  AVAILABLE:   { label: "Đang để trống", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  RENTED:      { label: "Đã có khách",   cls: "bg-orange-50 text-orange-700 border border-orange-200"   },
  MAINTENANCE: { label: "Bảo trì",       cls: "bg-slate-100 text-slate-600 border border-slate-200"     },
};

export default function StepHouseAndMoney({ form, update, houses, errors = {} }) {
  const [houseDetail, setHouseDetail] = useState(null);
  const [houseImageUrl, setHouseImageUrl] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!form.houseId) {
      setHouseDetail(null);
      setHouseImageUrl(null);
      return;
    }
    setLoadingHouse(true);
    Promise.all([getHouseById(form.houseId), getHouseImages(form.houseId)])
      .then(([detail, images]) => {
        if (cancelled) return;
        setHouseDetail(detail);
        setHouseImageUrl(Array.isArray(images) && images.length > 0 ? images[0].url : null);
      })
      .catch(() => {
        if (!cancelled) { setHouseDetail(null); setHouseImageUrl(null); }
      })
      .finally(() => { if (!cancelled) setLoadingHouse(false); });
    return () => { cancelled = true; };
  }, [form.houseId]);

  const depositDateValue = useMemo(
    () => (form.depositDate ? dayjs(form.depositDate, "YYYY-MM-DD") : null),
    [form.depositDate],
  );
  const handoverDateValue = useMemo(
    () => (form.handoverDate ? dayjs(form.handoverDate, "YYYY-MM-DD") : null),
    [form.handoverDate],
  );

  const statusCfg = HOUSE_STATUS[houseDetail?.status];
  const addressParts = [houseDetail?.address, houseDetail?.ward, houseDetail?.commune, houseDetail?.city]
    .filter(Boolean).join(", ");

  const areaChips = useMemo(() => {
    const areas = Array.isArray(houseDetail?.functionalAreas) ? houseDetail.functionalAreas : [];
    // Dedupe theo areaType, lấy tên area đầu tiên của mỗi loại
    const seen = {};
    areas.forEach((a) => {
      const k = a.areaType ?? "default";
      if (!seen[k]) seen[k] = a.name;
    });
    // [type, _, name]
    return Object.entries(seen).slice(0, 4).map(([type, name]) => [type, 1, name]);
  }, [houseDetail]);

  return (
    <>
      <div className="space-y-5">
        {/* ── Nhà cho thuê ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
              </svg>
            </span>
            <h3 className="text-base font-semibold text-slate-800">Nhà cho thuê</h3>
          </div>

          <div>
            <label className={labelClass}>Các căn nhà trống</label>
            <div className="relative">
              <select
                value={form.houseId ?? ""}
                onChange={update("houseId")}
                className={`${inputClass} appearance-none pr-9 ${errors.houseId ? "border-red-400 focus:ring-red-400" : ""}`}
              >
                <option value="">-- Chọn nhà --</option>
                {Array.isArray(houses) && houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name || h.title} — {h.address || ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.houseId && <p className="mt-1 text-xs text-red-500">{errors.houseId}</p>}
          </div>

          {/* Loading */}
          {loadingHouse && (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Đang tải thông tin nhà...
            </div>
          )}

          {/* House preview card */}
          {!loadingHouse && houseDetail && (
            <div className="rounded-xl border-2 border-teal-400 bg-white overflow-hidden grid" style={{ gridTemplateColumns: "2fr 3fr", minHeight: 220 }}>
              {/* Image — click to preview */}
              <div
                className={`relative bg-gradient-to-br from-slate-100 to-slate-200 ${houseImageUrl ? "cursor-zoom-in" : ""}`}
                onClick={() => houseImageUrl && setPreviewOpen(true)}
              >
                {houseImageUrl ? (
                  <img
                    src={houseImageUrl}
                    alt={houseDetail.name}
                    className="absolute inset-0 w-full h-full object-cover hover:brightness-95 transition duration-200"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info — right side */}
              <div className="flex-1 min-w-0 flex flex-col gap-3 p-4">
                {/* Name + status + check */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-bold text-slate-800 leading-snug">{houseDetail.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {statusCfg && (
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    )}
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500 text-white">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Address */}
                {addressParts && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-500" />
                    <span>{addressParts}</span>
                  </div>
                )}

                {/* Description */}
                {houseDetail.description && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {houseDetail.description}
                  </p>
                )}

                {/* Amenity chips */}
                {areaChips.length > 0 && (
                  <div className="space-y-1.5 mt-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tiện ích nổi bật</p>
                    <div className="flex flex-wrap gap-2">
                      {areaChips.map(([type, , name]) => {
                        const cfg = AREA_TYPE_CONFIG[type] ?? AREA_TYPE_CONFIG.default;
                        const { Icon } = cfg;
                        return (
                          <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            <Icon className="w-3.5 h-3.5" />
                            {name || cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Tiền & Chi phí ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M3 11h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
              </svg>
            </span>
            <h3 className="text-base font-semibold text-slate-800">Tiền & Chi phí</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tiền thuê (VNĐ) *</label>
              <div className="relative">
                <input inputMode="numeric" value={form.rentAmount ?? ""} onChange={update("rentAmount")}
                  placeholder="7,000,000"
                  className={`${inputClass} pr-14 ${errors.rentAmount ? "border-red-400 focus:ring-red-400" : ""}`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">VNĐ</span>
              </div>
              {errors.rentAmount && <p className="mt-1 text-xs text-red-500">{errors.rentAmount}</p>}
            </div>

            <div>
              <label className={labelClass}>Tiền cọc (VNĐ)</label>
              <div className="relative">
                <input inputMode="numeric" value={form.depositAmount ?? ""} onChange={update("depositAmount")}
                  placeholder="14,000,000"
                  className={`${inputClass} pr-14 ${errors.depositAmount ? "border-red-400 focus:ring-red-400" : ""}`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">VNĐ</span>
              </div>
              {errors.depositAmount && <p className="mt-1 text-xs text-red-500">{errors.depositAmount}</p>}
            </div>

            <div>
              <label className={labelClass}>Ngày thanh toán hàng tháng (1–28)</label>
              <input type="number" min={1} max={28} value={form.payDate ?? ""} onChange={update("payDate")}
                placeholder="5" className={`${inputClass} ${errors.payDate ? "border-red-400" : ""}`} />
              {errors.payDate && <p className="mt-1 text-xs text-red-500">{errors.payDate}</p>}
            </div>

            <div>
              <label className={labelClass}>Chu kỳ thanh toán</label>
              <div className="relative">
                <select value={form.payCycle ?? "monthly"} onChange={update("payCycle")}
                  className={`${inputClass} appearance-none pr-9`}>
                  <option value="monthly">Hàng tháng</option>
                  <option value="quarterly">Hàng quý</option>
                  <option value="biannual">Nửa năm</option>
                  <option value="annual">Hàng năm</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Số ngày hoàn trả cọc sau khi hết HĐ</label>
              <input type="number" min={0} value={form.depositRefundDays ?? ""} onChange={update("depositRefundDays")}
                placeholder="30" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Ngày đặt cọc</label>
              <DatePicker className={`w-full ${errors.depositDate ? "border-red-400" : ""}`}
                value={depositDateValue} format="DD/MM/YYYY" placeholder="Chọn ngày đặt cọc"
                status={errors.depositDate ? "error" : ""}
                onChange={(d) => update("depositDate")({ target: { value: d ? d.format("YYYY-MM-DD") : "" } })} />
              {errors.depositDate && <p className="mt-1 text-xs text-red-500">{errors.depositDate}</p>}
            </div>

            <div>
              <label className={labelClass}>Ngày bàn giao</label>
              <DatePicker className={`w-full ${errors.handoverDate ? "border-red-400" : ""}`}
                value={handoverDateValue} format="DD/MM/YYYY" placeholder="Chọn ngày bàn giao"
                status={errors.handoverDate ? "error" : ""}
                onChange={(d) => update("handoverDate")({ target: { value: d ? d.format("YYYY-MM-DD") : "" } })} />
              {errors.handoverDate && <p className="mt-1 text-xs text-red-500">{errors.handoverDate}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Lightbox ───────────────────────────────────── */}
      {previewOpen && houseImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={houseImageUrl}
              alt={houseDetail?.name}
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <p className="text-white text-sm font-semibold">{houseDetail?.name}</p>
              {addressParts && <p className="text-white/60 text-xs mt-0.5">{addressParts}</p>}
            </div>
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
