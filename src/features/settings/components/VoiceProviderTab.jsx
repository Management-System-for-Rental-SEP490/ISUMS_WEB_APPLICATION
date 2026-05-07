import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Phone, RefreshCw, Save } from "lucide-react";
import { getVoiceProvider, setVoiceProvider } from "../api/voiceProvider.api";

export default function VoiceProviderTab() {
  const { t } = useTranslation("common");
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
      setError(
        e?.response?.data?.message ||
          e?.message ||
          t("settings.voiceProvider.loadFailed"),
      );
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
      const next = data?.active ?? draft;
      setActive(next);
      setOkMsg(t("settings.voiceProvider.savedTo", { provider: next }));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          t("settings.voiceProvider.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const providerMeta = (id) => ({
    title: t(`settings.voiceProvider.providers.${id}.title`, { defaultValue: id }),
    desc: t(`settings.voiceProvider.providers.${id}.desc`, { defaultValue: "" }),
  });

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: "#3bb582" }} />
              {t("settings.voiceProvider.title")}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t("settings.voiceProvider.subtitle")}
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
            {t("settings.voiceProvider.reload")}
          </button>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
            }}
          >
            {error}
          </div>
        )}
        {okMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "#ECFDF5",
              border: "1px solid #6EE7B7",
              color: "#065F46",
            }}
          >
            {okMsg}
          </div>
        )}

        <div className="space-y-3">
          {available.length === 0 && !loading ? (
            <p className="text-sm text-gray-500">
              {t("settings.voiceProvider.empty")}
            </p>
          ) : null}
          {available.map((id) => {
            const meta = providerMeta(id);
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
                        {t("settings.voiceProvider.active")}
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
            {t("settings.voiceProvider.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-full text-sm flex items-center gap-2 text-white transition disabled:opacity-50"
            style={{ background: "#3bb582" }}
          >
            <Save className="w-4 h-4" />
            {saving
              ? t("settings.voiceProvider.saving")
              : t("settings.voiceProvider.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
