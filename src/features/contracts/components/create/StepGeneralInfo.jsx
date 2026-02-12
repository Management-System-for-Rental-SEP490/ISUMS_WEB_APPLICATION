import React from "react";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepGeneralInfo({ form, update }) {
  return (
    <div className="space-y-6">
      {/* Thông tin chung */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ngày bắt đầu *</label>
            <input
              type="date"
              value={form.startDate ?? ""}
              onChange={update("startDate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày kết thúc *</label>
            <input
              type="date"
              value={form.endDate ?? ""}
              onChange={update("endDate")}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Thông tin người thuê */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Thông tin người thuê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Họ tên người thuê *</label>
            <input
              value={form.name ?? ""}
              onChange={update("name")}
              placeholder="Nguyễn Văn A"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Số điện thoại *</label>
            <input
              value={form.phoneNumber ?? ""}
              onChange={update("phoneNumber")}
              placeholder="0987654321"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={update("email")}
              placeholder="nguyenvana@example.com"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Căn cước công dân *</label>
            <input
              type="text"
              value={form.identityNumber ?? ""}
              onChange={update("identityNumber")}
              placeholder="012345678901"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ngày cấp CCCD</label>
            <input
              type="date"
              value={form.dateOfIssue ?? ""}
              onChange={update("dateOfIssue")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nơi cấp CCCD</label>
            <input
              value={form.placeOfIssue ?? ""}
              onChange={update("placeOfIssue")}
              placeholder="Cục Cảnh sát QLHC về TTXH"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Địa chỉ thường trú *</label>
            <input
              value={form.tenantAddress ?? ""}
              onChange={update("tenantAddress")}
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
