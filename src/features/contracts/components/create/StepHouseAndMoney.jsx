import { DatePicker } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { getHouseById } from "../../../houses/api/houses.api";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

const STATUS_LABEL = {
  AVAILABLE: {
    text: "Còn trống",
    color: "text-green-700 bg-green-50 border-green-200",
  },
  RENTED: {
    text: "Đã có khách ở",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  MAINTENANCE: {
    text: "Đang sửa chữa",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
};

export default function StepHouseAndMoney({
  form,
  update,
  houses,
  errors = {},
}) {
  const [houseDetail, setHouseDetail] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      if (!form.houseId) {
        setHouseDetail(null);
        return;
      }
      setLoadingHouse(true);
      try {
        const data = await getHouseById(form.houseId);
        if (!cancelled) setHouseDetail(data);
      } catch {
        if (!cancelled) setHouseDetail(null);
      } finally {
        if (!cancelled) setLoadingHouse(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [form.houseId]);

  const depositDateValue = useMemo(
    () => (form.depositDate ? dayjs(form.depositDate, "YYYY-MM-DD") : null),
    [form.depositDate],
  );
  const handoverDateValue = useMemo(
    () => (form.handoverDate ? dayjs(form.handoverDate, "YYYY-MM-DD") : null),
    [form.handoverDate],
  );

  return (
    <div className="space-y-6">
      {/* Nhà cho thuê */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Nhà cho thuê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Các căn nhà trống</label>
            {Array.isArray(houses) && houses.length > 0 ? (
              <select
                value={form.houseId ?? ""}
                onChange={update("houseId")}
                className={`${inputClass} ${
                  errors.houseId ? "border-red-500 focus:ring-red-500" : ""
                }`}
              >
                <option value="">-- Chọn nhà --</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name || h.title} - {h.address || h.id}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.houseId ?? ""}
                onChange={update("houseId")}
                placeholder="Chọn nhà cho thuê"
                className={`${inputClass} ${
                  errors.houseId ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
            )}
            {errors.houseId && (
              <p className="mt-1 text-xs text-red-600">{errors.houseId}</p>
            )}
          </div>

          {/* House detail card */}
          {loadingHouse && (
            <div className="md:col-span-2 flex items-center gap-2 text-sm text-gray-500 py-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Đang tải thông tin nhà...
            </div>
          )}
          {!loadingHouse && houseDetail && (
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {houseDetail.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[
                      houseDetail.address,
                      houseDetail.ward,
                      houseDetail.commune,
                      houseDetail.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                {houseDetail.status && (
                  <span
                    className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border ${STATUS_LABEL[houseDetail.status]?.color ?? "text-slate-600 bg-slate-100 border-slate-200"}`}
                  >
                    {STATUS_LABEL[houseDetail.status]?.text ??
                      houseDetail.status}
                  </span>
                )}
              </div>
              {houseDetail.description && (
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                  {houseDetail.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tiền */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Tiền</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tiền thuê (VND) *</label>
            <input
              inputMode="numeric"
              value={form.rentAmount ?? ""}
              onChange={update("rentAmount")}
              placeholder="7000000"
              className={`${inputClass} ${
                errors.rentAmount ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.rentAmount && (
              <p className="mt-1 text-xs text-red-600">{errors.rentAmount}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Tiền cọc (VND)</label>
            <input
              inputMode="numeric"
              value={form.depositAmount ?? ""}
              onChange={update("depositAmount")}
              placeholder="14000000"
              className={`${inputClass} ${
                errors.depositAmount ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.depositAmount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.depositAmount}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Ngày thanh toán hàng tháng (1-28)
            </label>
            <input
              type="number"
              min={1}
              max={28}
              value={form.payDate ?? ""}
              onChange={update("payDate")}
              placeholder="5"
              className={`${inputClass} ${
                errors.payDate ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.payDate && (
              <p className="mt-1 text-xs text-red-600">{errors.payDate}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Chu kỳ thanh toán</label>
            <select
              value={form.payCycle ?? "monthly"}
              onChange={update("payCycle")}
              className={inputClass}
            >
              <option value="monthly">Hàng tháng</option>
              <option value="quarterly">Hàng quý</option>
              <option value="biannual">Nửa năm</option>
              <option value="annual">Hàng năm</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Số ngày hoàn trả cọc sau khi hết HĐ
            </label>
            <input
              type="number"
              min={0}
              value={form.depositRefundDays ?? ""}
              onChange={update("depositRefundDays")}
              placeholder="30"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày đặt cọc</label>

            <DatePicker
              className={`w-full ${errors.depositDate ? "border-red-500" : ""}`}
              value={depositDateValue}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày đặt cọc"
              status={errors.depositDate ? "error" : ""}
              onChange={(date) => {
                const iso = date ? date.format("YYYY-MM-DD") : "";
                update("depositDate")({ target: { value: iso } });
              }}
            />

            {errors.depositDate && (
              <p className="mt-1 text-xs text-red-600">{errors.depositDate}</p>
            )}
          </div>

          {/* ngày bàn giao và ngày đặt cọc căn nhà */}
          <div>
            <label className={labelClass}>Ngày bàn giao</label>

            <DatePicker
              className={`w-full ${errors.handoverDate ? "border-red-500" : ""}`}
              value={handoverDateValue}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bàn giao"
              status={errors.handoverDate ? "error" : ""}
              onChange={(date) => {
                const iso = date ? date.format("YYYY-MM-DD") : "";
                update("handoverDate")({ target: { value: iso } });
              }}
            />

            {errors.handoverDate && (
              <p className="mt-1 text-xs text-red-600">{errors.handoverDate}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
