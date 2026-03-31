import { DatePicker } from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { LoadingSpinner } from "../../../../components/shared/Loading";
import { getUserByEmail } from "../../../../services/authService";
import AddressPicker from "../../../../components/shared/AddressPicker";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepGeneralInfo({ form, update, errors = {} }) {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailLookupUser, setEmailLookupUser] = useState(null);
  const [emailLookupError, setEmailLookupError] = useState("");
  const startDateValue = useMemo(
    () => (form.startDate ? dayjs(form.startDate, "YYYY-MM-DD") : null),
    [form.startDate],
  );
  const endDateValue = useMemo(
    () => (form.endDate ? dayjs(form.endDate, "YYYY-MM-DD") : null),
    [form.endDate],
  );
  const dateOfIssueValue = useMemo(
    () => (form.dateOfIssue ? dayjs(form.dateOfIssue, "YYYY-MM-DD") : null),
    [form.dateOfIssue],
  );

  const [showTenantFields, setShowTenantFields] = useState(() => {
    const hasTenantInfo =
      !!form?.emailChecked ||
      !!form?.name ||
      !!form?.phoneNumber ||
      !!form?.identityNumber ||
      !!form?.tenantAddress;
    return hasTenantInfo;
  });
  const handleEmailChange = (e) => {
    update("email")(e);
    update("emailChecked")({ target: { value: false } });
    setEmailLookupError("");
    setEmailLookupUser(null);
    setShowTenantFields(false);
    clearTenantFields();
  };

  const handleCheckEmail = async () => {
    const email = String(form.email ?? "").trim();
    if (!email) {
      setEmailLookupError("Vui lòng nhập email trước khi kiểm tra.");
      return;
    }

    setCheckingEmail(true);
    setEmailLookupError("");
    setEmailLookupUser(null);

    try {
      const res = await getUserByEmail(email);
      const user = res?.data ?? res ?? null;
      if (
        user &&
        (user.name || user.identityNumber || user.dateOfIssue || user.fullName)
      ) {
        setEmailLookupUser(user);

        const name = user.name || user.fullName || user.username;
        const identity = user.identityNumber || user.idNumber;
        const dateOfIssue =
          user.dateOfIssue ||
          user.identityDateOfIssue ||
          "2026-02-21T00:00:00.000Z";

        if (name) update("name")({ target: { value: name } });
        if (identity) update("identityNumber")({ target: { value: identity } });
        if (dateOfIssue) {
          const iso = String(dateOfIssue).slice(0, 10);
          update("dateOfIssue")({ target: { value: iso } });
        }
        update("isNewAccount")({ target: { value: false } });
        setEmailLookupError("");
      } else {
        update("isNewAccount")({ target: { value: true } });
        setEmailLookupError(
          "Email chưa được đăng ký trong hệ thống. Bạn có thể nhập thông tin thủ công.",
        );
      }
    } catch (err) {
      update("isNewAccount")({ target: { value: true } });
      if (err?.status === 404) {
        setEmailLookupError("Người dùng chưa được đăng ký trong hệ thống.");
      } else {
        setEmailLookupError(
          "Không thể kiểm tra email. Vui lòng thử lại hoặc nhập thông tin thủ công.",
        );
      }
    } finally {
      setCheckingEmail(false);
      update("emailChecked")({ target: { value: true } });
      setShowTenantFields(true);
    }
  };
  const clearTenantFields = () => {
    update("name")({ target: { value: "" } });
    update("phoneNumber")({ target: { value: "" } });
    update("identityNumber")({ target: { value: "" } });
    update("dateOfIssue")({ target: { value: "" } });
    update("tenantAddress")({ target: { value: "" } });
  };
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
              value={startDateValue}
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
              value={endDateValue}
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
          <div className="md:col-span-2">
            <label className={labelClass}>Email / Gmail người thuê *</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={handleEmailChange}
                  placeholder="nguyenvana@example.com"
                  className={`${inputClass} pr-10 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {checkingEmail && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <LoadingSpinner size="sm" label="Đang kiểm tra email..." />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={checkingEmail}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-teal-500 text-teal-600 hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Kiểm tra email đã đăng ký hay chưa
              </button>
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
            {emailLookupError && !errors.email && (
              <p className="mt-1 text-xs text-amber-600">{emailLookupError}</p>
            )}
          </div>

          {showTenantFields && (
            <>
              {emailLookupUser && (
                <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Đã tìm thấy thông tin trong hệ thống và tự điền một số trường.
                  Bạn có thể chỉnh sửa lại nếu cần.
                </div>
              )}

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
                    errors.phoneNumber
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.phoneNumber}
                  </p>
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
                    errors.identityNumber
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.identityNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.identityNumber}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Ngày cấp CCCD</label>
                <DatePicker
                  className={`w-full ${inputClass} ${
                    errors.dateOfIssue ? "border-red-500" : ""
                  }`}
                  value={dateOfIssueValue}
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
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dateOfIssue}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Nơi cấp CCCD</label>
                <input
                  value={form.placeOfIssue}
                  onChange={update("placeOfIssue")}
                  placeholder="Cục Cảnh sát QLHC về TTXH"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <AddressPicker
                  value={form.tenantAddress ?? ""}
                  onChange={update("tenantAddress")}
                  error={errors.tenantAddress}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
