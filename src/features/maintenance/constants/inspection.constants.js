export const STATUS_CONFIG = {
  CREATED:     { labelKey: "inspection.status.CREATED",     color: "#5A7A6E", bg: "rgba(90,122,110,0.10)" },
  SCHEDULED:   { labelKey: "inspection.status.SCHEDULED",   color: "#2096d8", bg: "rgba(32,150,216,0.12)" },
  IN_PROGRESS: { labelKey: "inspection.status.IN_PROGRESS", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  DONE:        { labelKey: "inspection.status.DONE",        color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  APPROVED:    { labelKey: "inspection.status.APPROVED",    color: "#3bb582", bg: "rgba(59,181,130,0.15)" },
  CANCELLED:   { labelKey: "inspection.status.CANCELLED",   color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

// Thứ tự các bước chính (không gồm CANCELLED)
export const STATUS_STEPS = ["CREATED", "SCHEDULED", "IN_PROGRESS", "DONE", "APPROVED"];

export const EVENT_TYPE_CONFIG = {
  MAINTENANCE: { labelKey: "inspection.eventType.MAINTENANCE", color: "#2096d8", bg: "rgba(32,150,216,0.12)" },
  CHECK_IN:    { labelKey: "inspection.eventType.CHECK_IN",    color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  CHECK_OUT:   { labelKey: "inspection.eventType.CHECK_OUT",   color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " - " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export function conditionColor(pct) {
  if (pct >= 80) return "#3bb582";
  if (pct >= 50) return "#f59e0b";
  return "#D95F4B";
}
