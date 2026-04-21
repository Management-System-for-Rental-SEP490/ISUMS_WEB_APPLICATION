import React from "react";
import { useTranslation } from "react-i18next";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function StepContractClauses({ form, update, errors = {} }) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6">
      {/* Asset info & purpose */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.assetInfo")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.purpose")}</label>
            <select value={form.purpose} onChange={update("purpose")} className={inputClass}>
              <option value="Kinh doanh">{t("contracts.form.purposeBusiness")}</option>
              <option value="Để ở">{t("contracts.form.purposeLiving")}</option>
              <option value="Làm văn phòng">{t("contracts.form.purposeOffice")}</option>
              <option value="Cho thuê">{t("contracts.form.purposeSublet")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.area")}</label>
            <input value={form.area ?? ""} onChange={update("area")} placeholder="50m²"
              className={`${inputClass} ${errors.area ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t("contracts.form.structure")}</label>
            <input value={form.structure ?? ""} onChange={update("structure")} placeholder="1 phòng ngủ, 1 phòng khách, 1 bếp, 1 WC"
              className={`${inputClass} ${errors.structure ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.structure && <p className="mt-1 text-xs text-red-600">{errors.structure}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.ownershipDocs")}</label>
            <input value={form.ownershipDocs ?? ""} onChange={update("ownershipDocs")} placeholder="Sổ hồng, sổ GCN"
              className={`${inputClass} ${errors.ownershipDocs ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.ownershipDocs && <p className="mt-1 text-xs text-red-600">{errors.ownershipDocs}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.taxFeeNote")}</label>
            <input value={form.taxFeeNote ?? ""} onChange={update("taxFeeNote")} placeholder="Ai chịu thuế VAT, v.v." className={inputClass} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => update("hasPowerCutClause")({ target: { value: !form.hasPowerCutClause } })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.hasPowerCutClause ? "bg-teal-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.hasPowerCutClause ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-700">{t("contracts.form.hasPowerCutClause")}</p>
              <p className="text-xs text-gray-500">{t("contracts.form.hasPowerCutClauseDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Violation & late payment clauses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.violationClauses")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.lateDays")}</label>
            <input type="number" min={0} value={form.lateDays ?? ""} onChange={update("lateDays")} placeholder="3"
              className={`${inputClass} ${errors.lateDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.lateDays && <p className="mt-1 text-xs text-red-600">{errors.lateDays}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.latePenaltyPercent")}</label>
            <input type="number" min={0} max={100} value={form.latePenaltyPercent ?? ""} onChange={update("latePenaltyPercent")} placeholder="5"
              className={`${inputClass} ${errors.latePenaltyPercent ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.latePenaltyPercent && <p className="mt-1 text-xs text-red-600">{errors.latePenaltyPercent}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.maxLateDays")}</label>
            <input type="number" min={0} value={form.maxLateDays ?? ""} onChange={update("maxLateDays")} placeholder="10"
              className={`${inputClass} ${errors.maxLateDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.maxLateDays && <p className="mt-1 text-xs text-red-600">{errors.maxLateDays}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.cureDays")}</label>
            <input type="number" min={0} value={form.cureDays ?? ""} onChange={update("cureDays")} placeholder="7"
              className={`${inputClass} ${errors.cureDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.cureDays && <p className="mt-1 text-xs text-red-600">{errors.cureDays}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t("contracts.form.earlyTerminationPenalty")}</label>
            <textarea rows={2} value={form.earlyTerminationPenalty ?? ""} onChange={update("earlyTerminationPenalty")}
              placeholder="Mất toàn bộ tiền cọc" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t("contracts.form.landlordBreachCompensation")}</label>
            <textarea rows={2} value={form.landlordBreachCompensation ?? ""} onChange={update("landlordBreachCompensation")}
              placeholder="Đền cọc gấp đôi" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Notice & renewal clauses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.noticeClauses")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.renewNoticeDays")}</label>
            <input type="number" min={0} value={form.renewNoticeDays ?? ""} onChange={update("renewNoticeDays")} placeholder="30"
              className={`${inputClass} ${errors.renewNoticeDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.renewNoticeDays && <p className="mt-1 text-xs text-red-600">{errors.renewNoticeDays}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.landlordNoticeDays")}</label>
            <input type="number" min={0} value={form.landlordNoticeDays ?? ""} onChange={update("landlordNoticeDays")} placeholder="30"
              className={`${inputClass} ${errors.landlordNoticeDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.landlordNoticeDays && <p className="mt-1 text-xs text-red-600">{errors.landlordNoticeDays}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.forceMajeureNoticeHours")}</label>
            <input type="number" min={0} value={form.forceMajeureNoticeHours ?? ""} onChange={update("forceMajeureNoticeHours")} placeholder="24"
              className={`${inputClass} ${errors.forceMajeureNoticeHours ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.forceMajeureNoticeHours && <p className="mt-1 text-xs text-red-600">{errors.forceMajeureNoticeHours}</p>}
          </div>
        </div>
      </div>

      {/* Dispute resolution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.disputeResolution")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.disputeDays")}</label>
            <input type="number" min={0} value={form.disputeDays ?? ""} onChange={update("disputeDays")} placeholder="30"
              className={`${inputClass} ${errors.disputeDays ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.disputeDays && <p className="mt-1 text-xs text-red-600">{errors.disputeDays}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.disputeForum")}</label>
            <input value={form.disputeForum ?? ""} onChange={update("disputeForum")} placeholder="Tòa án nhân dân có thẩm quyền"
              className={`${inputClass} ${errors.disputeForum ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.disputeForum && <p className="mt-1 text-xs text-red-600">{errors.disputeForum}</p>}
          </div>
        </div>
      </div>

      {/* Contract details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">{t("contracts.form.contractDetails")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("contracts.form.copies")}</label>
            <input type="number" min={1} value={form.copies ?? ""} onChange={update("copies")} placeholder="2"
              className={`${inputClass} ${errors.copies ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.copies && <p className="mt-1 text-xs text-red-600">{errors.copies}</p>}
          </div>
          <div>
            <label className={labelClass}>{t("contracts.form.eachKeep")}</label>
            <input type="number" min={1} value={form.eachKeep ?? ""} onChange={update("eachKeep")} placeholder="1"
              className={`${inputClass} ${errors.eachKeep ? "border-red-500 focus:ring-red-500" : ""}`} />
            {errors.eachKeep && <p className="mt-1 text-xs text-red-600">{errors.eachKeep}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
