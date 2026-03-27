import React from "react";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepContractClauses({ form, update, errors = {} }) {
  return (
    <div className="space-y-6">
      {/* Thông tin tài sản & mục đích thuê */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Thông tin tài sản & mục đích thuê
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mục đích thuê</label>
            <select
              value={form.purpose ?? "Để ở"}
              onChange={update("purpose")}
              className={inputClass}
            >
              <option value="Kinh doanh">Kinh doanh</option>
              <option value="Để ở">Để ở</option>
              <option value="Làm văn phòng">Làm văn phòng</option>
              <option value="Cho thuê">Cho thuê</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Diện tích</label>
            <input
              value={form.area ?? ""}
              onChange={update("area")}
              placeholder="50m²"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Kết cấu nhà</label>
            <input
              value={form.structure ?? ""}
              onChange={update("structure")}
              placeholder="1 phòng ngủ, 1 phòng khách, 1 bếp, 1 WC"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Giấy tờ pháp lý căn nhà</label>
            <input
              value={form.ownershipDocs ?? ""}
              onChange={update("ownershipDocs")}
              placeholder="Sổ hồng, sổ GCN"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ghi chú thuế & phí</label>
            <input
              value={form.taxFeeNote ?? ""}
              onChange={update("taxFeeNote")}
              placeholder="Ai chịu thuế VAT, v.v."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Điều khoản vi phạm & phạt trễ hạn */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Điều khoản vi phạm & phạt trễ hạn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Số ngày ân hạn trước khi tính phạt
            </label>
            <input
              type="number"
              min={0}
              value={form.lateDays ?? ""}
              onChange={update("lateDays")}
              placeholder="3"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              % phạt trên tiền thuê nếu trả trễ
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.latePenaltyPercent ?? ""}
              onChange={update("latePenaltyPercent")}
              placeholder="5"
              className={`${inputClass} ${errors.latePenaltyPercent ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.latePenaltyPercent && (
              <p className="mt-1 text-xs text-red-600">
                {errors.latePenaltyPercent}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Số ngày trễ tối đa trước khi chấm dứt HĐ
            </label>
            <input
              type="number"
              min={0}
              value={form.maxLateDays ?? ""}
              onChange={update("maxLateDays")}
              placeholder="10"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Số ngày để khắc phục vi phạm</label>
            <input
              type="number"
              min={0}
              value={form.cureDays ?? ""}
              onChange={update("cureDays")}
              placeholder="7"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              Điều khoản phạt chấm dứt HĐ sớm
            </label>
            <textarea
              rows={2}
              value={form.earlyTerminationPenalty ?? ""}
              onChange={update("earlyTerminationPenalty")}
              placeholder="Mất toàn bộ tiền cọc"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              Mức bồi thường nếu chủ nhà vi phạm HĐ
            </label>
            <textarea
              rows={2}
              value={form.landlordBreachCompensation ?? ""}
              onChange={update("landlordBreachCompensation")}
              placeholder="Đền cọc gấp đôi"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Điều khoản thông báo & gia hạn */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Điều khoản thông báo & gia hạn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Ngày báo trước khi gia hạn HĐ</label>
            <input
              type="number"
              min={0}
              value={form.renewNoticeDays ?? ""}
              onChange={update("renewNoticeDays")}
              placeholder="30"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Ngày chủ nhà báo trước khi chấm dứt
            </label>
            <input
              type="number"
              min={0}
              value={form.landlordNoticeDays ?? ""}
              onChange={update("landlordNoticeDays")}
              placeholder="30"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Giờ thông báo khi xảy ra bất khả kháng
            </label>
            <input
              type="number"
              min={0}
              value={form.forceMajeureNoticeHours ?? ""}
              onChange={update("forceMajeureNoticeHours")}
              placeholder="24"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Giải quyết tranh chấp */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Giải quyết tranh chấp</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Số ngày để hai bên tự thương lượng
            </label>
            <input
              type="number"
              min={0}
              value={form.disputeDays ?? ""}
              onChange={update("disputeDays")}
              placeholder="30"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cơ quan giải quyết tranh chấp</label>
            <input
              value={form.disputeForum ?? ""}
              onChange={update("disputeForum")}
              placeholder="Tòa án nhân dân có thẩm quyền"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Thông tin bản hợp đồng */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Thông tin bản hợp đồng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Số bản hợp đồng được lập</label>
            <input
              type="number"
              min={1}
              value={form.copies ?? ""}
              onChange={update("copies")}
              placeholder="2"
              className={`${inputClass} ${errors.copies ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.copies && (
              <p className="mt-1 text-xs text-red-600">{errors.copies}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Mỗi bên giữ (số bản)</label>
            <input
              type="number"
              min={1}
              value={form.eachKeep ?? ""}
              onChange={update("eachKeep")}
              placeholder="1"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
