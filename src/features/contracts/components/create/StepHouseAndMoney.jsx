import React from "react";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepHouseAndMoney({ form, update, houses }) {
  return (
    <div className="space-y-6">
      {/* Nhà cho thuê */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Nhà cho thuê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Mã nhà (houseId) *</label>
            {Array.isArray(houses) && houses.length > 0 ? (
              <select
                value={form.houseId ?? ""}
                onChange={update("houseId")}
                className={inputClass}
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
                placeholder="Nhập UUID nhà (VD: 70279423-989d-48dc-8f2e-9bd6508a6f4a)"
                className={inputClass}
              />
            )}
          </div>
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
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tiền cọc (VND)</label>
            <input
              inputMode="numeric"
              value={form.depositAmount ?? ""}
              onChange={update("depositAmount")}
              placeholder="14000000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày thanh toán hàng tháng (1-28)</label>
            <input
              type="number"
              min={1}
              max={28}
              value={form.payDate ?? ""}
              onChange={update("payDate")}
              placeholder="5"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày đặt cọc</label>
            <input
              type="date"
              value={form.depositDate ?? ""}
              onChange={update("depositDate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày bàn giao</label>
            <input
              type="date"
              value={form.handoverDate ?? ""}
              onChange={update("handoverDate")}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
