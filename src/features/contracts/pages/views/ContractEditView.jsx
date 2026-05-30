import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs";
import ContractHtmlEditor from "../../components/editor/ContractHtmlEditor";
import { updateContractHtml } from "../../api/contracts.api";
import { extractBodyFromHtml, wrapBodyWithFullDocument } from "../../utils/contractHtml.utils";

export default function ContractEditView({ contract, onBack, onSaved }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const initialBodyHtml = useMemo(
    () => extractBodyFromHtml(contract?.html ?? ""),
    [contract?.html],
  );

  const [bodyHtml, setBodyHtml] = useState(initialBodyHtml);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleSave = async () => {
    if (!contract?.id) {
      setError("Thiếu ID hợp đồng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content = editorRef.current?.getContent?.() ?? bodyHtml;
      const fullHtml = wrapBodyWithFullDocument(content);
      await updateContractHtml(contract.id, fullHtml);
      onSaved?.();
      onBack();
    } catch (err) {
      setError(err?.message ?? "Không thể lưu hợp đồng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: t("breadcrumb.home"), onClick: () => navigate("/dashboard") },
          { label: t("sidebar.manageContracts"), onClick: onBack },
          { label: contract?.contractNumber ?? contract?.name ?? t("breadcrumb.detail") },
          { label: t("actions.edit") },
        ]}
      />

      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Chỉnh sửa hợp đồng
            </h2>
            <p className="text-gray-600 text-sm">
              {contract?.contractNumber ?? contract?.name ?? "—"}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <ContractHtmlEditor
          initialHtml={initialBodyHtml}
          onChange={setBodyHtml}
          onEditorReady={(editor) => {
            editorRef.current = editor;
          }}
        />

        <div className="pt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
