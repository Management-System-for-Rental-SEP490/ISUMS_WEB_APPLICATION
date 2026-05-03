import React from "react";

const WRAP_CLASS =
  "flex flex-col items-center justify-center gap-3 rounded-2xl border border-brand-border bg-brand-card px-6 py-12 text-center shadow-card";
const ICON_WRAP_CLASS =
  "flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand-border";
const TITLE_CLASS = "text-sm font-semibold text-brand-fg";
const DESC_CLASS = "text-xs text-brand-muted-fg";

export default function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className={WRAP_CLASS}>
      {Icon ? (
        <div className={ICON_WRAP_CLASS}>
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <div>
        <div className={TITLE_CLASS}>{title}</div>
        {description ? <div className={DESC_CLASS}>{description}</div> : null}
      </div>
    </div>
  );
}
