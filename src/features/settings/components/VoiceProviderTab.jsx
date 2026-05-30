import React, { useEffect, useState } from "react";
import { Phone, RefreshCw, Save } from "lucide-react";
import {
  getVoiceProvider,
  setVoiceProvider,
} from "../api/voiceProvider.api";

const PROVIDER_LABELS = {
  STRINGEE: {
    title: "Stringee",
    desc: "Số Việt Nam, TTS tiếng Việt native, giá rẻ. Production recommended.",
  },
  AWS_PINPOINT: {
    title: "AWS Pinpoint Voice",
    desc: "Số quốc tế (US/UK), Polly Vietnamese (Lan/Hieu). Test only — caller ID nước ngoài.",
  },
  TWILIO: {
    title: "Twilio",
    desc: "Số quốc tế, TwiML voice. Fallback option.",
  },
  SPEEDSMS: {
    title: "SpeedSMS",
    desc: "Voice OTP digits-only. Hạn chế free-form text.",
  },
};

export default function VoiceProviderTab() {
  const [active, setActive] = useState("");
  const [available, setAvailable] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVoiceProvider();
      setActive(data?.active ?? "");
      setAvailable(Array.isArray(data?.available) ? data.available : []);
      setDraft(data?.active ?? "");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Không tải được cấu hình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dirty = draft && draft !== active;

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const data = await setVoiceProvider(draft);
      setActive(data?.active ?? draft);
      setOkMsg(`Đã chuyển sang ${data?.active ?? draft}`);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Không lưu được");
    } finally {
      setSaving(false);
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: "#3bb582" }} />
              Voice Provider
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Chọn nhà cung cấp dịch vụ gọi voice cho cảnh báo PREMIUM. Áp dụng
              ngay sau khi lưu (cache 5 phút).
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-full text-sm flex items-center gap-2 transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" }}
          >
            {error}
          </div>
        )}
        {okMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", color: "#065F46" }}
          >
            {okMsg}
          </div>
        )}

        <div className="space-y-3">
          {available.length === 0 && !loading ? (
            <p className="text-sm text-gray-500">Không có provider nào sẵn sàng.</p>
          ) : null}
          {available.map((id) => {
            const meta = PROVIDER_LABELS[id] || { title: id, desc: "" };
            const checked = draft === id;
            const isActive = active === id;
            return (
              <label
                key={id}
                className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition"
                style={{
                  border: checked ? "2px solid #3bb582" : "1px solid #C4DED5",
                  background: checked ? "#F0FDF4" : "#FFFFFF",
                }}
              >
                <input
                  type="radio"
                  name="voice-provider"
                  value={id}
                  checked={checked}
                  onChange={() => setDraft(id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: "#1E2D28" }}>
                      {meta.title}
                    </span>
                    {isActive && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#DCFCE7", color: "#166534" }}
                      >
                        Đang dùng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{meta.desc}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{id}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setDraft(active)}
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-full text-sm transition disabled:opacity-50"
            style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-full text-sm flex items-center gap-2 text-white transition disabled:opacity-50"
            style={{ background: "#3bb582" }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
