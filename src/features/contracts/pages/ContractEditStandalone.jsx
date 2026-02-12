import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContractById, updateContractHtml } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import {
  extractBodyFromHtml,
  wrapBodyWithFullDocument,
} from "../utils/contractHtml.utils";
import ContractHtmlEditor from "../components/ContractHtmlEditor";

export default function ContractEditStandalone() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [bodyHtml, setBodyHtml] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getContractById(id);
        const mapped = mapContractFromApi(raw);
        if (mounted) {
          setContract(mapped);
          setBodyHtml(extractBodyFromHtml(mapped.html ?? ""));
        }
      } catch (err) {
        if (mounted) setError(err?.message ?? "Không thể tải hợp đồng.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!contract?.id) {
      setError("Thiếu ID hợp đồng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content =
        editorRef.current?.getContent?.() ?? bodyHtml;
      const fullHtml = wrapBodyWithFullDocument(content);
      await updateContractHtml(contract.id, fullHtml);
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      setError(err?.message ?? "Không thể lưu hợp đồng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Chỉnh sửa hợp đồng
            </h1>
            <p className="text-sm text-gray-600">
              {contract?.contractNumber ?? contract?.name ?? id}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/contracts/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              disabled={saving}
            >
              Xem hợp đồng
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard", { state: { menu: "contracts" } })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              disabled={saving}
            >
              Quay về Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {loading && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-gray-600">Đang tải hợp đồng...</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
          </div>
        )}

        {!loading && !error && contract && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <ContractHtmlEditor
                initialHtml={bodyHtml}
                onChange={setBodyHtml}
                onEditorReady={(editor) => {
                  editorRef.current = editor;
                }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/contracts/${id}`)}
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

            {/* TinyMCE đã là WYSIWYG nên có thể xem trực tiếp trong editor */}
          </div>
        )}
      </main>
    </div>
  );
}
