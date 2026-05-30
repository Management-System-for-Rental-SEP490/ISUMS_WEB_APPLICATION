import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldAlert,
  Siren,
  TriangleAlert,
} from "lucide-react";
import AlertCard from "../components/AlertCard";
import { useTenantAlerts } from "../hooks/useTenantAlerts";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const STATUS_OPTIONS = ["ALL", "PENDING", "HANDLED"];
const SEVERITY_OPTIONS = ["ALL", "CRITICAL", "WARNING", "INFO"];

function StatBadge({ icon: Icon, label, value, color, pulse }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3 flex-1 min-w-[160px]"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${color}40`,
        boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.06)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{ background: `${color}1F` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
        {pulse && value > 0 && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 0 0 ${color}99`,
              animation: "tenantAlertPulse 1.5s infinite",
            }}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider truncate" style={{ color: "#5A7A6E" }}>
          {label}
        </p>
        <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SegmentedFilter({ options, value, onChange, labelFn }) {
  return (
    <div
      className="inline-flex rounded-xl p-1"
      style={{ background: "#F0FAF6", border: "1px solid #C4DED5" }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="text-xs font-semibold rounded-lg px-3 py-1.5 transition"
            style={{
              background: active ? "#FFFFFF" : "transparent",
              color: active ? "#1E2D28" : "#5A7A6E",
              boxShadow: active ? "0px 1px 2px rgba(16,24,40,0.08)" : "none",
            }}
          >
            {labelFn(opt)}
          </button>
        );
      })}
    </div>
  );
}

export default function TenantAlertsPage() {
  const { t } = useTranslation("common");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("PENDING");
  const [lifeSafetyOnly, setLifeSafetyOnly] = useState(false);
  const [daysBack, setDaysBack] = useState(7);

  const { data, loading, error, refetch, acknowledge, pendingId } = useTenantAlerts({
    severity,
    status,
    lifeSafety: lifeSafetyOnly,
    daysBack,
    limit: 200,
  });

  const grouped = useMemo(() => {
    const result = {
      lifeSafety: [],
      critical: [],
      warning: [],
      info: [],
      handled: [],
    };
    for (const item of data.items ?? []) {
      if (item.acknowledged) {
        result.handled.push(item);
        continue;
      }
      if (item.lifeSafety) {
        result.lifeSafety.push(item);
        continue;
      }
      if (item.severity === "CRITICAL") result.critical.push(item);
      else if (item.severity === "WARNING") result.warning.push(item);
      else result.info.push(item);
    }
    return result;
  }, [data.items]);

  return (
    <div className="space-y-5 md:space-y-6">

      <style>{`
        @keyframes tenantAlertPulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>

      <div className="flex items-end justify-between flex-wrap gap-4" style={{ paddingTop: 4 }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND_GREEN }}>
            {t("tenantAlerts.subtitle", { defaultValue: "Theo dõi sự cố trong nhà thuê" })}
          </p>
          <h2
            className="font-heading text-3xl font-bold"
            style={{
              background: BRAND_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("tenantAlerts.title", { defaultValue: "Cảnh báo từ khách thuê" })}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#5A7A6E" }}>
            {t("tenantAlerts.helper", {
              defaultValue:
                "Theo dõi gas, khói, nhiệt độ, độ ẩm và các báo cáo từ khách thuê — ưu tiên xử lý các sự cố ảnh hưởng tính mạng.",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition"
          style={{
            background: "#FFFFFF",
            border: "1px solid #C4DED5",
            color: "#1E2D28",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: BRAND_GREEN }} />
          {t("tenantAlerts.refresh", { defaultValue: "Làm mới" })}
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-2"
          style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.25)" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#D95F4B" }} />
          <p className="text-sm" style={{ color: "#D95F4B" }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <StatBadge
          icon={Siren}
          color="#ef4444"
          label={t("tenantAlerts.stats.lifeSafety", { defaultValue: "Khẩn cấp tính mạng" })}
          value={data.lifeSafetyCount ?? 0}
          pulse
        />
        <StatBadge
          icon={ShieldAlert}
          color="#dc2626"
          label={t("tenantAlerts.stats.critical", { defaultValue: "Nghiêm trọng" })}
          value={data.criticalCount ?? 0}
        />
        <StatBadge
          icon={TriangleAlert}
          color="#f59e0b"
          label={t("tenantAlerts.stats.warning", { defaultValue: "Cảnh báo" })}
          value={data.warningCount ?? 0}
        />
        <StatBadge
          icon={CheckCircle2}
          color="#10b981"
          label={t("tenantAlerts.stats.handled", { defaultValue: "Đã xử lý" })}
          value={data.acknowledgedCount ?? 0}
        />
      </div>

      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between flex-wrap gap-3"
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.06)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: "#5A7A6E" }}>
            <Filter className="w-3.5 h-3.5" />
            {t("tenantAlerts.filter.title", { defaultValue: "Bộ lọc" })}
          </span>
          <SegmentedFilter
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            labelFn={(o) => t(`tenantAlerts.filter.status.${o}`, { defaultValue: o })}
          />
          <SegmentedFilter
            options={SEVERITY_OPTIONS}
            value={severity}
            onChange={setSeverity}
            labelFn={(o) => t(`tenantAlerts.filter.severity.${o}`, { defaultValue: o })}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label
            className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer rounded-lg px-2.5 py-1.5 transition"
            style={{
              background: lifeSafetyOnly ? "rgba(239,68,68,0.10)" : "transparent",
              border: `1px solid ${lifeSafetyOnly ? "rgba(239,68,68,0.40)" : "#C4DED5"}`,
              color: lifeSafetyOnly ? "#b91c1c" : "#5A7A6E",
            }}
          >
            <input
              type="checkbox"
              checked={lifeSafetyOnly}
              onChange={(e) => setLifeSafetyOnly(e.target.checked)}
              className="w-3.5 h-3.5"
              style={{ accentColor: "#ef4444" }}
            />
            {t("tenantAlerts.filter.lifeSafetyOnly", { defaultValue: "Chỉ nhóm tính mạng" })}
          </label>

          <select
            value={daysBack}
            onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
            className="text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none"
            style={{ background: "#FFFFFF", border: "1px solid #C4DED5", color: "#1E2D28" }}
          >
            <option value={1}>{t("tenantAlerts.filter.days.1", { defaultValue: "Hôm nay" })}</option>
            <option value={3}>{t("tenantAlerts.filter.days.3", { defaultValue: "3 ngày" })}</option>
            <option value={7}>{t("tenantAlerts.filter.days.7", { defaultValue: "7 ngày" })}</option>
            <option value={14}>{t("tenantAlerts.filter.days.14", { defaultValue: "14 ngày" })}</option>
            <option value={30}>{t("tenantAlerts.filter.days.30", { defaultValue: "30 ngày" })}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-24 animate-pulse"
              style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
            />
          ))}
        </div>
      ) : (data.items?.length ?? 0) === 0 ? (
        <div
          className="rounded-2xl py-16 flex flex-col items-center justify-center text-center"
          style={{ background: "#FFFFFF", border: "1px dashed #C4DED5" }}
        >
          <div className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center" style={{ background: "rgba(16,185,129,0.10)" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "#10b981" }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: "#1E2D28" }}>
            {t("tenantAlerts.empty.title", { defaultValue: "Tất cả an toàn" })}
          </p>
          <p className="text-sm" style={{ color: "#5A7A6E" }}>
            {t("tenantAlerts.empty.subtitle", {
              defaultValue: "Không có cảnh báo trong khoảng thời gian đã chọn.",
            })}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.lifeSafety.length > 0 && (
            <Section
              title={t("tenantAlerts.section.lifeSafety", { defaultValue: "🚨 Khẩn cấp — Liên quan tính mạng" })}
              count={grouped.lifeSafety.length}
              color="#ef4444"
              alerts={grouped.lifeSafety}
              onAcknowledge={acknowledge}
              pendingId={pendingId}
            />
          )}
          {grouped.critical.length > 0 && (
            <Section
              title={t("tenantAlerts.section.critical", { defaultValue: "Nghiêm trọng" })}
              count={grouped.critical.length}
              color="#dc2626"
              alerts={grouped.critical}
              onAcknowledge={acknowledge}
              pendingId={pendingId}
            />
          )}
          {grouped.warning.length > 0 && (
            <Section
              title={t("tenantAlerts.section.warning", { defaultValue: "Cảnh báo" })}
              count={grouped.warning.length}
              color="#f59e0b"
              alerts={grouped.warning}
              onAcknowledge={acknowledge}
              pendingId={pendingId}
            />
          )}
          {grouped.info.length > 0 && (
            <Section
              title={t("tenantAlerts.section.info", { defaultValue: "Thông tin" })}
              count={grouped.info.length}
              color="#3b82f6"
              alerts={grouped.info}
              onAcknowledge={acknowledge}
              pendingId={pendingId}
            />
          )}
          {grouped.handled.length > 0 && (
            <Section
              title={t("tenantAlerts.section.handled", { defaultValue: "Đã xử lý" })}
              count={grouped.handled.length}
              color="#10b981"
              alerts={grouped.handled}
              onAcknowledge={acknowledge}
              pendingId={pendingId}
              dimmed
            />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, count, color, alerts, onAcknowledge, pendingId, dimmed = false }) {
  return (
    <div className="space-y-2.5" style={{ opacity: dimmed ? 0.85 : 1 }}>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
          style={{ background: `${color}1F`, color }}
        >
          {title}
          <span className="ml-1.5 px-1.5 py-px rounded-full tabular-nums" style={{ background: color, color: "#FFFFFF", fontSize: 10 }}>
            {count}
          </span>
        </span>
        <span className="flex-1 h-px" style={{ background: `${color}30` }} />
      </div>
      <div className="space-y-2.5">
        {alerts.map((a) => (
          <AlertCard
            key={a.alertId}
            alert={a}
            onAcknowledge={onAcknowledge}
            busy={pendingId === a.alertId}
          />
        ))}
      </div>
    </div>
  );
}
