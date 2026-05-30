import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  ExternalLink,
  Home,
  MapPin,
  Send,
  ShieldAlert,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

const CRITICAL_LIFE_SAFETY = {
  bg: "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.04) 100%)",
  border: "rgba(239,68,68,0.50)",
  accent: "#ef4444",
  iconBg: "rgba(239,68,68,0.18)",
  pillBg: "#ef4444",
  pillFg: "#FFFFFF",
};

const CRITICAL = {
  bg: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
  border: "rgba(239,68,68,0.30)",
  accent: "#ef4444",
  iconBg: "rgba(239,68,68,0.12)",
  pillBg: "rgba(239,68,68,0.15)",
  pillFg: "#b91c1c",
};

const WARNING = {
  bg: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)",
  border: "rgba(245,158,11,0.35)",
  accent: "#f59e0b",
  iconBg: "rgba(245,158,11,0.14)",
  pillBg: "rgba(245,158,11,0.15)",
  pillFg: "#92400e",
};

const INFO = {
  bg: "#FFFFFF",
  border: "#C4DED5",
  accent: "#3b82f6",
  iconBg: "rgba(59,130,246,0.10)",
  pillBg: "rgba(59,130,246,0.10)",
  pillFg: "#1e40af",
};

const RESOLVED = {
  bg: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.01) 100%)",
  border: "rgba(16,185,129,0.30)",
  accent: "#10b981",
  iconBg: "rgba(16,185,129,0.12)",
  pillBg: "rgba(16,185,129,0.12)",
  pillFg: "#065f46",
};

function pickStyle(alert) {
  if (alert.acknowledged) return RESOLVED;
  if (alert.lifeSafety && alert.severity === "CRITICAL") return CRITICAL_LIFE_SAFETY;
  if (alert.severity === "CRITICAL") return CRITICAL;
  if (alert.severity === "WARNING") return WARNING;
  return INFO;
}

function pickIcon(alert) {
  const m = (alert.metric ?? "").toLowerCase();
  const t = (alert.alertType ?? "").toLowerCase();
  if (m.includes("gas") || t.includes("gas")) return Wind;
  if (m.includes("smoke") || t.includes("smoke") || t.includes("fire")) return Flame;
  if (m.includes("temp")) return Thermometer;
  if (m.includes("humid")) return Droplet;
  if (m.includes("electric") || m.includes("power") || m.includes("voltage")) return Zap;
  if (m.includes("water") || m.includes("leak")) return Droplet;
  return ShieldAlert;
}

function relativeTime(ts, t) {
  if (!ts) return "—";
  const now = Date.now();
  const diffMs = now - Number(ts);
  if (diffMs < 0) return dayjs(Number(ts)).format("DD/MM HH:mm");
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("tenantAlerts.time.justNow", { defaultValue: "Vừa xong" });
  if (minutes < 60) return t("tenantAlerts.time.minutesAgo", { count: minutes, defaultValue: `${minutes} phút trước` });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("tenantAlerts.time.hoursAgo", { count: hours, defaultValue: `${hours} giờ trước` });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("tenantAlerts.time.daysAgo", { count: days, defaultValue: `${days} ngày trước` });
  return dayjs(Number(ts)).format("DD/MM/YYYY HH:mm");
}

export default function AlertCard({ alert, onAcknowledge, busy = false }) {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");

  const style = pickStyle(alert);
  const Icon = pickIcon(alert);
  const locale = i18n.language;
  const dateFormat = locale?.startsWith("en") ? "MM/DD/YYYY HH:mm" : "DD/MM/YYYY HH:mm";

  const isCriticalActive = alert.severity === "CRITICAL" && !alert.acknowledged;
  const isLifeSafety = alert.lifeSafety && !alert.acknowledged;

  const handleAck = () => {
    onAcknowledge?.(alert.houseId, alert.alertId, note?.trim() || null);
    setShowNoteInput(false);
    setNote("");
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: isLifeSafety
          ? "0px 0px 0px 4px rgba(239,68,68,0.10), 0px 4px 12px rgba(239,68,68,0.18)"
          : "0px 1px 3px 0px rgba(16,24,40,0.08)",
      }}
    >
      <div
        className="px-4 py-3 flex items-start gap-3"
        style={{ borderLeft: `4px solid ${style.accent}` }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: style.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: style.accent }} />
          {isLifeSafety && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{
                background: "#ef4444",
                boxShadow: "0 0 0 0 rgba(239,68,68,0.7)",
                animation: "tenantAlertPulse 1.5s infinite",
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
              style={{ background: style.pillBg, color: style.pillFg }}
            >
              {alert.acknowledged
                ? t("tenantAlerts.status.handled", { defaultValue: "Đã xử lý" })
                : isLifeSafety
                ? t("tenantAlerts.severity.lifeSafety", { defaultValue: "Khẩn cấp" })
                : t(`tenantAlerts.severity.${alert.severity}`, { defaultValue: alert.severity })}
            </span>
            {alert.metric && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.05)", color: "#5A7A6E" }}>
                {alert.metric}
              </span>
            )}
            <span className="text-[11px] flex items-center gap-1" style={{ color: "#8ab5a3" }}>
              <Clock className="w-3 h-3" />
              {relativeTime(alert.ts, t)}
            </span>
          </div>

          <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: "#1E2D28" }}>
            {alert.title || t(`tenantAlerts.metric.${alert.metric}`, { defaultValue: alert.alertType || "—" })}
            {alert.value != null && (
              <span className="ml-1.5 text-xs font-semibold tabular-nums" style={{ color: style.accent }}>
                ({alert.value})
              </span>
            )}
          </p>

          {alert.detail && (
            <p className="text-xs mb-1.5" style={{ color: "#5A7A6E" }}>
              {alert.detail}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-[11px]" style={{ color: "#5A7A6E" }}>
            {alert.houseName && (
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" />
                {alert.houseName}
              </span>
            )}
            {alert.areaName && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {alert.areaName}
              </span>
            )}
            {alert.thing && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.04)", color: "#8ab5a3" }}>
                {alert.thing}
              </span>
            )}
          </div>

          {alert.acknowledged && (
            <div
              className="mt-2 px-2.5 py-1.5 rounded-lg text-[11px] flex items-start gap-1.5"
              style={{ background: "rgba(16,185,129,0.08)", color: "#065f46" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <div className="min-w-0">
                <span className="font-semibold">
                  {t("tenantAlerts.handledBy", { defaultValue: "Xử lý" })}
                </span>{" "}
                {alert.acknowledgedAt
                  ? dayjs(Number(alert.acknowledgedAt)).format(dateFormat)
                  : "—"}
                {alert.resolutionNote && (
                  <p className="mt-0.5">{alert.resolutionNote}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {alert.houseId && (
            <button
              type="button"
              onClick={() => navigate(`/houses/${alert.houseId}`)}
              className="p-1.5 rounded-lg transition"
              style={{ color: "#5A7A6E" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(59,181,130,0.12)";
                e.currentTarget.style.color = "#3bb582";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#5A7A6E";
              }}
              title={t("tenantAlerts.openHouse", { defaultValue: "Mở chi tiết nhà" })}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {!alert.acknowledged && (
            <button
              type="button"
              onClick={() => setShowNoteInput((v) => !v)}
              disabled={busy}
              className="text-[11px] font-semibold rounded-lg px-2.5 py-1 flex items-center gap-1 transition"
              style={{
                background: style.accent,
                color: "#FFFFFF",
                opacity: busy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!busy) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (!busy) e.currentTarget.style.opacity = "1"; }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("tenantAlerts.action.acknowledge", { defaultValue: "Xử lý" })}
            </button>
          )}
        </div>
      </div>

      {showNoteInput && !alert.acknowledged && (
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderTop: "1px dashed rgba(196,222,213,0.6)", background: "rgba(255,255,255,0.5)" }}
        >
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("tenantAlerts.action.notePlaceholder", { defaultValue: "Ghi chú xử lý (tùy chọn)" })}
            className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{ border: "1px solid #C4DED5", color: "#1E2D28" }}
            maxLength={500}
            autoFocus
          />
          <button
            type="button"
            onClick={handleAck}
            disabled={busy}
            className="text-xs font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1 transition"
            style={{ background: style.accent, color: "#FFFFFF", opacity: busy ? 0.6 : 1 }}
          >
            <Send className="w-3.5 h-3.5" />
            {t("tenantAlerts.action.confirmAck", { defaultValue: "Xác nhận" })}
          </button>
          <button
            type="button"
            onClick={() => { setShowNoteInput(false); setNote(""); }}
            className="text-xs font-semibold rounded-lg px-3 py-1.5"
            style={{ background: "transparent", color: "#5A7A6E", border: "1px solid #C4DED5" }}
          >
            {t("tenantAlerts.action.cancel", { defaultValue: "Huỷ" })}
          </button>
        </div>
      )}
    </div>
  );
}
