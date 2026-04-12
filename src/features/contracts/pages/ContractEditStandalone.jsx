import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContractById, updateContractHtml } from "../api/contracts.api";
import { mapContractFromApi } from "../utils/mapContractFromApi";
import { toast } from "react-toastify";
import {
  LoadingOverlay,
  LoadingSpinner,
} from "../../../components/shared/Loading";
import {
  extractBodyFromHtml,
  wrapBodyWithFullDocument,
} from "../utils/contractHtml.utils";
import ContractHtmlEditor from "../components/editor/ContractHtmlEditor";
import Icons from "../components/standalone/ContractEditIcons";

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
        const status = err?.response?.status;
        const msg =
          status === 403 ? "Bạn không có quyền chỉnh sửa hợp đồng này." :
          status === 404 ? "Không tìm thấy hợp đồng." :
          "Không thể tải hợp đồng, vui lòng thử lại.";
        if (mounted) setError(msg);
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
      toast.error("Thiếu ID hợp đồng.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content = editorRef.current?.getContent?.() ?? bodyHtml;
      const fullHtml = wrapBodyWithFullDocument(content);
      await updateContractHtml(contract.id, fullHtml);
      toast.success("Chỉnh sửa hợp đồng thành công!");
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 403 ? "Bạn không có quyền chỉnh sửa hợp đồng này." :
        status === 404 ? "Không tìm thấy hợp đồng." :
        "Không thể lưu hợp đồng, vui lòng thử lại.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
          {/* Left: title + meta */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 border border-amber-300/80 flex-shrink-0">
              <Icons.FileEdit />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  Chỉnh sửa hợp đồng
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Đang chỉnh sửa
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                <Icons.Hash />
                <span className="truncate">
                  {contract?.contractNumber ?? contract?.name ?? id}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/contracts/${id}`)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/80 px-3.5 py-2 text-[13px] font-semibold text-teal-700 bg-transparent hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Icons.Eye />
              Xem hợp đồng
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/contracts")
              }
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-[13px] font-semibold text-slate-600 bg-transparent hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Icons.LayoutDashboard />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Saving overlay */}
      <LoadingOverlay open={saving} label="Đang lưu hợp đồng..." />

      {/* Main */}
      <main className="px-6 pb-10 pt-6">
        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm px-12 py-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
            <LoadingSpinner size="lg" showLabel label="Đang tải hợp đồng..." />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-4xl mx-auto mb-4 bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <Icons.AlertTriangle />
            </div>
            <p className="m-0 text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Editor area */}
        {!loading && contract && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Info banner */}
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-[13px] font-medium text-blue-700">
              <Icons.Info />
              <span>
                Chỉnh sửa nội dung hợp đồng bên dưới. Nhấn{" "}
                <span className="font-semibold">Lưu thay đổi</span> để cập nhật.
              </span>
            </div>

            {/* Editor card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 flex items-center justify-center">
                    <Icons.FileEdit />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    Nội dung hợp đồng
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-amber-300", "bg-emerald-400"].map(
                    (c, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-2 rounded-full opacity-80 ${c}`}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Editor */}
              <div>
                <ContractHtmlEditor
                  initialHtml={bodyHtml}
                  onChange={setBodyHtml}
                  onEditorReady={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              </div>

              {/* Footer actions */}
              <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => navigate(`/contracts/${id}`)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  <Icons.X />
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2 text-[13px] font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {saving ? <Icons.Loader /> : <Icons.Save />}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
