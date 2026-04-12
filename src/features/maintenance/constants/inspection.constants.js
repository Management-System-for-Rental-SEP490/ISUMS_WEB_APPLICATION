export const STATUS_CONFIG = {
  DONE: { label: "HOÀN THÀNH", color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  IN_PROGRESS: { label: "IN PROGRESS", color: "#2096d8", bg: "rgba(32,150,216,0.12)" },
  CREATED: { label: "MỚI TẠO", color: "#5A7A6E", bg: "rgba(90,122,110,0.10)" },
  CANCELLED: { label: "ĐÃ HỦY", color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

export const EVENT_TYPE_CONFIG = {
  MAINTENANCE: { label: "BẢO TRÌ", color: "#2096d8", bg: "rgba(32,150,216,0.12)" },
  CHECK_IN: { label: "BÀN GIAO", color: "#3bb582", bg: "rgba(59,181,130,0.12)" },
  CHECK_OUT: { label: "KẾT THÚC", color: "#D95F4B", bg: "rgba(217,95,75,0.10)" },
};

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " - " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
}

export function conditionColor(pct) {
  if (pct >= 80) return "#3bb582";
  if (pct >= 50) return "#f59e0b";
  return "#D95F4B";
}
