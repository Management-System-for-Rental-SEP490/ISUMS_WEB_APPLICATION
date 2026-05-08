import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { PERIOD_PRESETS, formatRange } from "../utils/period";

const BRAND_GREEN = "#3bb582";

const PRESET_KEYS = [
  PERIOD_PRESETS.THIS_MONTH,
  PERIOD_PRESETS.LAST_MONTH,
  PERIOD_PRESETS.THIS_QUARTER,
  PERIOD_PRESETS.LAST_6_MONTHS,
  PERIOD_PRESETS.YEAR_TO_DATE,
  PERIOD_PRESETS.LAST_YEAR,
];

export default function FinanceDateRangePicker({ preset, period, onPresetChange, onCustomRange }) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(period.from.format("YYYY-MM-DD"));
  const [customTo, setCustomTo] = useState(period.to.format("YYYY-MM-DD"));
  const ref = useRef(null);

  useEffect(() => {
    setCustomFrom(period.from.format("YYYY-MM-DD"));
    setCustomTo(period.to.format("YYYY-MM-DD"));
  }, [period.from, period.to]);

  useEffect(() => {
    function onClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function applyCustom() {
    const f = dayjs(customFrom);
    const tt = dayjs(customTo).endOf("day");
    if (!f.isValid() || !tt.isValid() || !f.isBefore(tt)) return;
    onCustomRange(f, tt);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition"
        style={{
          background: "#FFFFFF",
          border: "1px solid #C4DED5",
          color: "#1E2D28",
          boxShadow: "0px 1px 3px 0px rgba(16,24,40,0.06)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FAF6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
      >
        <Calendar className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        <span>{t(`finance.period.${preset}`, { defaultValue: preset })}</span>
        <span className="text-xs font-normal" style={{ color: "#8ab5a3" }}>
          {formatRange(period.from, period.to)}
        </span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden z-50"
          style={{
            background: "#FFFFFF",
            border: "1px solid #C4DED5",
            boxShadow: "0px 12px 32px rgba(16,24,40,0.18)",
          }}
        >
          <ul className="py-2">
            {PRESET_KEYS.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    onPresetChange(key);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition"
                  style={{
                    background: preset === key ? "rgba(59,181,130,0.10)" : "transparent",
                    color: preset === key ? BRAND_GREEN : "#1E2D28",
                    fontWeight: preset === key ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (preset !== key) e.currentTarget.style.background = "#F0FAF6";
                  }}
                  onMouseLeave={(e) => {
                    if (preset !== key) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {t(`finance.period.${key}`, { defaultValue: key })}
                </button>
              </li>
            ))}
          </ul>
          <div
            className="px-4 py-3 border-t space-y-2"
            style={{ borderColor: "rgba(196,222,213,0.5)", background: "#F8FBF9" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>
              {t("finance.period.CUSTOM", { defaultValue: "Tùy chỉnh" })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-xs"
                style={{ border: "1px solid #C4DED5", color: "#1E2D28" }}
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 text-xs"
                style={{ border: "1px solid #C4DED5", color: "#1E2D28" }}
              />
            </div>
            <button
              type="button"
              onClick={applyCustom}
              className="w-full rounded-lg py-1.5 text-xs font-semibold transition"
              style={{ background: BRAND_GREEN, color: "#FFFFFF" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t("finance.period.apply", { defaultValue: "Áp dụng" })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
