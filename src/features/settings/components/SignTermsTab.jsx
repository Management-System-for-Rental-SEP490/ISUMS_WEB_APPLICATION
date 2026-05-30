import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, Save, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  getMySignTermsAll,
  upsertSignTerms,
  resetSignTermsToDefault,
} from "../api/signTerms.api";

const LOCALE_LABELS = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
};
const LOCALES = ["vi", "en", "ja"];
const MIN_LEN = 50;
const MAX_LEN = 20000;

export default function SignTermsTab() {
  const [activeLocale, setActiveLocale] = useState("vi");
  const [contents, setContents] = useState({ vi: "", en: "", ja: "" });
  const [original, setOriginal] = useState({ vi: "", en: "", ja: "" });
  const [meta, setMeta] = useState({ vi: null, en: null, ja: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const list = await getMySignTermsAll();
      const next = { vi: "", en: "", ja: "" };
      const nextMeta = { vi: null, en: null, ja: null };
      for (const item of list) {
        if (item?.locale && next[item.locale] !== undefined) {
          next[item.locale] = item.content || "";
          nextMeta[item.locale] = {
            version: item.version,
            isDefault: Boolean(item.isDefault),
            updatedAt: item.updatedAt,
          };
        }
      }
      setContents(next);
      setOriginal(next);
      setMeta(nextMeta);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || e?.message || "Tải nội dung thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const currentContent = contents[activeLocale] ?? "";
  const currentMeta = meta[activeLocale];
  const isDirty = currentContent !== (original[activeLocale] ?? "");
  const charCount = currentContent.length;
  const isValid = charCount >= MIN_LEN && charCount <= MAX_LEN;

  const handleChange = (value) => {
    setContents((prev) => ({ ...prev, [activeLocale]: value }));
    setSuccessMsg("");
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!isValid) {
      setErrorMsg(`Nội dung phải có từ ${MIN_LEN} đến ${MAX_LEN} ký tự (hiện ${charCount}).`);
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertSignTerms(activeLocale, currentContent);
      setOriginal((prev) => ({ ...prev, [activeLocale]: currentContent }));
      setMeta((prev) => ({
        ...prev,
        [activeLocale]: {
          version: saved?.version ?? (prev[activeLocale]?.version ?? 0) + 1,
          isDefault: false,
          updatedAt: saved?.updatedAt ?? new Date().toISOString(),
        },
      }));
      setSuccessMsg(`Đã lưu điều khoản (${LOCALE_LABELS[activeLocale]}). Phiên bản #${saved?.version ?? "?"}`);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || e?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Khôi phục điều khoản ${LOCALE_LABELS[activeLocale]} về mặc định? Nội dung tùy chỉnh hiện tại sẽ bị xóa.`)) {
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setResetting(true);
    try {
      await resetSignTermsToDefault(activeLocale);
      await loadAll();
      setSuccessMsg(`Đã khôi phục điều khoản ${LOCALE_LABELS[activeLocale]} về mặc định.`);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || e?.message || "Khôi phục thất bại");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#FAFFFE",
          border: "1px solid #C4DED5",
          boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
        }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            <FileText size={20} color="white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "#1E2D28" }}>
              Điều khoản & điều kiện ký số
            </h3>
            <p className="text-sm mt-1" style={{ color: "#5A7A6E" }}>
              Nội dung này sẽ hiển thị cho người thuê khi họ ký hợp đồng điện tử. Soạn riêng cho từng ngôn ngữ.
              Mặc định đã chuẩn theo Luật Giao dịch điện tử 2023, Nghị định 13/2023/NĐ-CP, Luật Nhà ở 2023.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {LOCALES.map((lc) => {
            const m = meta[lc];
            const isActive = activeLocale === lc;
            return (
              <button
                key={lc}
                type="button"
                onClick={() => setActiveLocale(lc)}
                className="px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)"
                    : "white",
                  color: isActive ? "white" : "#1E2D28",
                  border: isActive ? "none" : "1px solid #C4DED5",
                }}
              >
                {LOCALE_LABELS[lc]}
                {m && !m.isDefault ? (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : "#E6F4EE",
                      color: isActive ? "white" : "#2A8E63",
                    }}
                  >
                    v{m.version}
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : "#FFF7E6",
                      color: isActive ? "white" : "#A06A00",
                    }}
                  >
                    Mặc định
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin" color="#3bb582" />
            <span className="ml-3 text-sm" style={{ color: "#5A7A6E" }}>
              Đang tải...
            </span>
          </div>
        ) : (
          <>
            <textarea
              value={currentContent}
              onChange={(e) => handleChange(e.target.value)}
              rows={20}
              spellCheck={false}
              className="w-full font-mono text-sm rounded-xl px-4 py-3 focus:outline-none transition"
              style={{
                border: isValid ? "1px solid #C4DED5" : "1px solid #FCA5A5",
                background: "white",
                color: "#1E2D28",
                lineHeight: 1.6,
                resize: "vertical",
                minHeight: "320px",
              }}
              placeholder={`Soạn nội dung điều khoản ký số (${LOCALE_LABELS[activeLocale]})...`}
            />

            <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
              <div className="text-xs" style={{ color: charCount > MAX_LEN || charCount < MIN_LEN ? "#DC2626" : "#5A7A6E" }}>
                {charCount.toLocaleString()} / {MAX_LEN.toLocaleString()} ký tự
                {charCount < MIN_LEN ? ` (tối thiểu ${MIN_LEN})` : ""}
                {currentMeta?.updatedAt && !currentMeta.isDefault ? (
                  <span className="ml-3 text-[#94A3B8]">
                    · Cập nhật lần cuối: {new Date(currentMeta.updatedAt).toLocaleString("vi-VN")}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting || saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  style={{
                    background: "white",
                    color: "#5A7A6E",
                    border: "1px solid #C4DED5",
                    opacity: resetting || saving ? 0.6 : 1,
                    cursor: resetting || saving ? "not-allowed" : "pointer",
                  }}
                >
                  {resetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  Khôi phục mặc định
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || !isValid || saving}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 text-white"
                  style={{
                    background:
                      !isDirty || !isValid || saving
                        ? "#94A3B8"
                        : "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
                    boxShadow: !isDirty || !isValid || saving ? "none" : "0 4px 12px rgba(59,181,130,0.30)",
                    cursor: !isDirty || !isValid || saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu điều khoản
                </button>
              </div>
            </div>

            {errorMsg ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {successMsg ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D" }}
              >
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div
        className="rounded-2xl p-5 text-xs"
        style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569", lineHeight: 1.6 }}
      >
        <strong style={{ color: "#1E2D28" }}>Lưu ý pháp lý:</strong> Mặc định gói khoản đã được soạn dựa trên
        Luật Giao dịch điện tử 2023 (Điều 9, 10, 22, 23), Bộ luật Dân sự 2015 (Điều 387, 398), Luật Nhà ở 2023
        (Điều 163, 164), Luật Bảo vệ quyền lợi người tiêu dùng 2023, Nghị định 13/2023/NĐ-CP (PDPL) và
        Nghị định 130/2018/NĐ-CP. Nếu bạn tùy chỉnh, vui lòng đảm bảo nội dung không lược bỏ các điều khoản
        bảo vệ người tiêu dùng và xử lý dữ liệu cá nhân theo quy định.
      </div>
    </div>
  );
}
