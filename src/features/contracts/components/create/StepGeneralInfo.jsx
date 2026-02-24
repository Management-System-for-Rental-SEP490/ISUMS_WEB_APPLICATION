import { DatePicker } from "antd";
import dayjs from "dayjs";
import React from "react";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepGeneralInfo({ form, update, errors = {} }) {
  return (
    <div className="space-y-6">
      {/* Thông tin chung */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ngày bắt đầu *</label>
            <DatePicker
              className={`w-full ${errors.startDate ? "border-red-500" : ""}`}
              value={
                form.startDate ? dayjs(form.startDate, "YYYY-MM-DD") : null
              }
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
              status={errors.startDate ? "error" : ""}
              onChange={(date) => {
                const iso = date ? date.format("YYYY-MM-DD") : "";
                update("startDate")({ target: { value: iso } });
              }}
            />

            {errors.startDate && (
              <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Ngày kết thúc *</label>
            <DatePicker
              className={`w-full ${errors.endDate ? "border-red-500" : ""}`}
              value={form.endDate ? dayjs(form.endDate, "YYYY-MM-DD") : null}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
              status={errors.endDate ? "error" : ""}
              disabledDate={(current) => {
                if (!form.startDate) return false;
                return (
                  current &&
                  current < dayjs(form.startDate, "YYYY-MM-DD").startOf("day")
                );
              }}
              onChange={(date) => {
                const iso = date ? date.format("YYYY-MM-DD") : "";
                update("endDate")({ target: { value: iso } });
              }}
            />

            {errors.endDate && (
              <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
            )}
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
              className={`${inputClass} ${
                errors.name ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Số điện thoại *</label>
            <input
              value={form.phoneNumber ?? ""}
              onChange={update("phoneNumber")}
              placeholder="0987654321"
              className={`${inputClass} ${
                errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={update("email")}
              placeholder="nguyenvana@example.com"
              className={`${inputClass} ${
                errors.email ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Căn cước công dân *</label>
            <input
              type="text"
              value={form.identityNumber ?? ""}
              onChange={update("identityNumber")}
              placeholder="012345678901"
              className={`${inputClass} ${
                errors.identityNumber ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.identityNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.identityNumber}
              </p>
            )}
          </div>
          {/* <div>
            <label className={labelClass}>Ngày cấp CCCD</label>
            <input
              type="date"
              value={form.dateOfIssue ?? ""}
              onChange={update("dateOfIssue")}
              className={`${inputClass} ${
                errors.dateOfIssue ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.dateOfIssue && (
              <p className="mt-1 text-xs text-red-600">{errors.dateOfIssue}</p>
            )}
          </div> */}
          <div>
            <label className={labelClass}>Ngày cấp CCCD</label>

            <DatePicker
              className={`w-full ${inputClass} ${
                errors.dateOfIssue ? "border-red-500" : ""
              }`}
              value={
                form.dateOfIssue ? dayjs(form.dateOfIssue, "YYYY-MM-DD") : null
              }
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
              onChange={(_, dateString) => {
                const iso = dateString
                  ? dayjs(dateString, "DD/MM/YYYY").format("YYYY-MM-DD")
                  : "";
                update("dateOfIssue")({ target: { value: iso } });
              }}
              status={errors.dateOfIssue ? "error" : ""}
            />

            {errors.dateOfIssue && (
              <p className="mt-1 text-xs text-red-600">{errors.dateOfIssue}</p>
            )}
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
              className={`${inputClass} ${
                errors.tenantAddress ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.tenantAddress && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tenantAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
