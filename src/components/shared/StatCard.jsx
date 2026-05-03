import React from "react";

const CARD_CLASS =
  "relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-card";
const BODY_CLASS = "flex items-center justify-between gap-4 px-4 py-3";
const LABEL_CLASS = "text-xs font-semibold uppercase tracking-widest text-brand-muted-fg";
const VALUE_CLASS = "text-2xl font-semibold text-brand-fg";

const TONE_STYLES = {
  brand: { bar: "bg-brand-green" },
  emerald: { bar: "bg-emerald-500" },
  amber: { bar: "bg-amber-500" },
  indigo: { bar: "bg-indigo-500" },
  violet: { bar: "bg-violet-500" },
  slate: { bar: "bg-slate-500" },
  sky: { bar: "bg-sky-500" },
};

export default function StatCard({ label, value, tone = "brand" }) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.brand;

  return (
    <div className={CARD_CLASS}>
      <div className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} />
      <div className={BODY_CLASS}>
        <div>
          <div className={LABEL_CLASS}>{label}</div>
          <div className={VALUE_CLASS}>{value}</div>
        </div>
      </div>
    </div>
  );
}
