import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { formatVnd } from "../utils/currency";

const BRAND_GREEN = "#3bb582";
const BRAND_GRADIENT = "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)";

const COLOR_MAP = {
  revenue: { iconBg: "rgba(16,185,129,0.12)", iconColor: "#10b981", border: "rgba(16,185,129,0.28)", accent: "#10b981" },
  expense: { iconBg: "rgba(239,68,68,0.12)", iconColor: "#ef4444", border: "rgba(239,68,68,0.28)", accent: "#ef4444" },
  profit: { iconBg: "rgba(59,130,246,0.12)", iconColor: "#3b82f6", border: "rgba(59,130,246,0.28)", accent: "#3b82f6" },
  outstanding: { iconBg: "rgba(245,158,11,0.12)", iconColor: "#f59e0b", border: "rgba(245,158,11,0.28)", accent: "#f59e0b" },
};

function useAnimatedNumber(target, durationMs = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const safeTarget = Number(target) || 0;
    const start = performance.now();
    const initial = value;
    let raf;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(initial + (safeTarget - initial) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function DeltaChip({ percent, invertGood }) {
  if (percent == null) return null;
  const positive = percent > 0;
  const neutral = Math.abs(percent) < 0.05;
  const isGood = invertGood ? !positive : positive;
  const colorOk = neutral ? "#64748b" : isGood ? "#10b981" : "#ef4444";
  const bgOk = neutral ? "rgba(100,116,139,0.10)" : isGood ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)";
  const Icon = neutral ? Minus : positive ? ArrowUp : ArrowDown;
  const label = `${positive ? "+" : ""}${percent.toFixed(1)}%`;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5"
      style={{ background: bgOk, color: colorOk }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function FinanceKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "revenue",
  loading = false,
  deltaPercent = null,
  invertGoodOnDelta = false,
  rawValue,
}) {
  const { i18n } = useTranslation("common");
  const locale = i18n.language;
  const c = COLOR_MAP[variant] ?? COLOR_MAP.revenue;
  const animated = useAnimatedNumber(rawValue ?? 0);
  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group relative"
      style={{ background: "#FFFFFF", border: `1px solid ${c.border}`, boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: BRAND_GRADIENT }} />
      <div className="p-5 flex items-start gap-4 flex-1 relative">
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.06] pointer-events-none" style={{ background: c.accent }} />
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
          style={{ background: c.iconBg }}
        >
          {Icon ? <Icon className="w-6 h-6" style={{ color: c.iconColor }} /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-medium truncate" style={{ color: "#5A7A6E" }}>{title}</p>
            {!loading && deltaPercent != null && (
              <DeltaChip percent={deltaPercent} invertGood={invertGoodOnDelta} />
            )}
          </div>
          {loading ? (
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background: "#EAF4F0" }} />
          ) : (
            <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: "#1E2D28" }}>
              {value !== undefined ? value : formatVnd(animated, locale)}
            </p>
          )}
          {!loading && subtitle && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#8ab5a3" }}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
