import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { MapPin } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHouseById } from "../../../houses/api/houses.api";
import ImageCarousel from "../../../../components/shared/ImageCarousel";
import { AREA_TYPE_CONFIG } from "../../../houses/components/HouseDetailModal";

function formatMoney(val) {
  if (val === "" || val == null) return "";
  const digits = String(val).replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const inputClass =
  "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-400 transition placeholder:text-slate-400";

const HOUSE_STATUS_KEYS = {
  AVAILABLE:   { tKey: "AVAILABLE",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  RENTED:      { tKey: "RENTED",      cls: "bg-orange-50 text-orange-700 border border-orange-200"   },
  MAINTENANCE: { tKey: "MAINTENANCE", cls: "bg-slate-100 text-slate-600 border border-slate-200"     },
};

export default function StepHouseAndMoney({ form, update, houses, errors = {} }) {
  const { t } = useTranslation("common");
  const [houseDetail, setHouseDetail] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);

  const handleMoneyChange = (field) => (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    update(field)({ target: { value: digits ? Number(digits) : "" } });
  };

  useEffect(() => {
    let cancelled = false;
    if (!form.houseId) { setHouseDetail(null); return; }
    setLoadingHouse(true);
    getHouseById(form.houseId)
      .then((detail) => { if (!cancelled) setHouseDetail(detail); })
      .catch(() => { if (!cancelled) setHouseDetail(null); })
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

  const statusCfg = HOUSE_STATUS_KEYS[houseDetail?.status];
  const addressParts = [houseDetail?.address, houseDetail?.ward, houseDetail?.commune, houseDetail?.city]
    .filter(Boolean).join(", ");

  const areaChips = useMemo(() => {
    const areas = Array.isArray(houseDetail?.functionalAreas) ? houseDetail.functionalAreas : [];
    const seen = {};
    areas.forEach((a) => {
      const k = a.areaType ?? "default";
      if (!seen[k]) seen[k] = a.name;
    });
    return Object.entries(seen).slice(0, 4).map(([type, name]) => [type, 1, name]);
  }, [houseDetail]);

  return (
    <>
      <div className="space-y-5">
        {/* Rental property */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
              </svg>
            </span>
            <h3 className="text-base font-semibold text-slate-800">{t("contracts.form.rentalHouse")}</h3>
          </div>

          <div>
            <label className={labelClass}>{t("contracts.form.availableHouses")}</label>
            <Select
              value={form.houseId ?? undefined}
              onChange={(val) => update("houseId")({ target: { value: val } })}
              placeholder={t("contracts.form.selectHouse")}
              showSearch
              optionFilterProp="label"
              status={errors.houseId ? "error" : ""}
              style={{ width: "100%" }}
              options={Array.isArray(houses) ? houses.map((h) => ({
                value: h.id,
                label: `${h.name || h.title}${h.address ? ` — ${h.address}` : ""}`,
              })) : []}
            />
            {errors.houseId && <p className="mt-1 text-xs text-red-500">{errors.houseId}</p>}
          </div>

          {loadingHouse && (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t("contracts.form.loadingHouse")}
            </div>
          )}

          {/* Missing legal fields warning — contract template renders "—" without these. */}
          {!loadingHouse && houseDetail && (
            houseDetail.areaM2 == null ||
            !houseDetail.structure ||
            !houseDetail.landCertNumber
          ) && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <span className="text-amber-600 text-xl leading-none">⚠️</span>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-900">Nhà chưa đủ thông tin pháp lý</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  {houseDetail.areaM2 == null && "Chưa có diện tích. "}
                  {!houseDetail.structure && "Chưa có kết cấu. "}
                  {!houseDetail.landCertNumber && "Chưa có số GCN. "}
                  Hợp đồng sẽ hiển thị <b>—</b> thay cho các ô này khi render.
                  Cập nhật ở <b>Quản lý nhà → chi tiết nhà</b> rồi quay lại.
                </p>
              </div>
            </div>
          )}

          {/* House preview card */}
          {!loadingHouse && houseDetail && (
            <div className="rounded-xl border-2 border-teal-400 bg-white overflow-hidden grid" style={{ gridTemplateColumns: "2fr 3fr", minHeight: 220 }}>
              {/*
                Grid cell needs `h-full min-h-[220px]` because the parent
                only sets minHeight on the container, not the row track —
                without it, the inner ImageCarousel's `h-full` computed
                to 0 and the image column rendered blank (screenshot
                feedback 2026-04: "Mất ảnh rồi"). `min-h-[220px]` also
                covers the "no images" fallback so the empty-state icon
                stays centred inside a visible box.
              */}
              <div className="overflow-hidden h-full min-h-[220px]">
                <ImageCarousel images={houseDetail.images ?? []} alt={houseDetail.name} height="h-full min-h-[220px]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-bold text-slate-800 leading-snug">{houseDetail.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {statusCfg && (
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${statusCfg.cls}`}>
                        {t(`dashboard.map.${statusCfg.tKey}`, { defaultValue: houseDetail.status })}
                      </span>
                    )}
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500 text-white">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                {addressParts && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-500" />
                    <span>{addressParts}</span>
                  </div>
                )}
                {houseDetail.description && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{houseDetail.description}</p>
                )}
                {areaChips.length > 0 && (
                  <div className="space-y-1.5 mt-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("contracts.form.houseAmenities")}</p>
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

        {/* Rent & costs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M3 11h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
              </svg>
            </span>
            <h3 className="text-base font-semibold text-slate-800">{t("contracts.form.money")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("contracts.form.rent")}</label>
              <div className="relative">
                <input inputMode="numeric" value={formatMoney(form.rentAmount)} onChange={handleMoneyChange("rentAmount")}
                  placeholder="7,000,000"
                  className={`${inputClass} pr-14 ${errors.rentAmount ? "border-red-400 focus:ring-red-400" : ""}`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">VNĐ</span>
              </div>
              {errors.rentAmount && <p className="mt-1 text-xs text-red-500">{errors.rentAmount}</p>}
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.deposit")}</label>
              <div className="relative">
                <input inputMode="numeric" value={formatMoney(form.depositAmount)} onChange={handleMoneyChange("depositAmount")}
                  placeholder="14,000,000"
                  className={`${inputClass} pr-14 ${errors.depositAmount ? "border-red-400 focus:ring-red-400" : ""}`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">VNĐ</span>
              </div>
              {errors.depositAmount && <p className="mt-1 text-xs text-red-500">{errors.depositAmount}</p>}
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.payDate")}</label>
              <input type="number" min={1} max={28} value={form.payDate ?? ""} onChange={update("payDate")}
                placeholder="5" className={`${inputClass} ${errors.payDate ? "border-red-400" : ""}`} />
              {errors.payDate && <p className="mt-1 text-xs text-red-500">{errors.payDate}</p>}
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.payCycle")}</label>
              <Select
                value={form.payCycle ?? "monthly"}
                onChange={(val) => update("payCycle")({ target: { value: val } })}
                style={{ width: "100%" }}
                options={[
                  { value: "monthly",   label: t("contracts.form.payCycleMonthly") },
                  { value: "quarterly", label: t("contracts.form.payCycleQuarterly") },
                  { value: "biannual",  label: t("contracts.form.payCycleBiannual") },
                  { value: "annual",    label: t("contracts.form.payCycleAnnual") },
                ]}
              />
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.depositRefundDays")}</label>
              <input type="number" min={0} value={form.depositRefundDays ?? ""} onChange={update("depositRefundDays")}
                placeholder="30" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.depositDate")}</label>
              <DatePicker className={`w-full ${errors.depositDate ? "border-red-400" : ""}`}
                value={depositDateValue} format="DD/MM/YYYY"
                placeholder={t("contracts.form.depositDate")}
                status={errors.depositDate ? "error" : ""}
                onChange={(d) => update("depositDate")({ target: { value: d ? d.format("YYYY-MM-DD") : "" } })} />
              {errors.depositDate && <p className="mt-1 text-xs text-red-500">{errors.depositDate}</p>}
            </div>

            <div>
              <label className={labelClass}>{t("contracts.form.handoverDate")}</label>
              <DatePicker className={`w-full ${errors.handoverDate ? "border-red-400" : ""}`}
                value={handoverDateValue} format="DD/MM/YYYY"
                placeholder={t("contracts.form.handoverDate")}
                status={errors.handoverDate ? "error" : ""}
                onChange={(d) => update("handoverDate")({ target: { value: d ? d.format("YYYY-MM-DD") : "" } })} />
              {errors.handoverDate && <p className="mt-1 text-xs text-red-500">{errors.handoverDate}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
