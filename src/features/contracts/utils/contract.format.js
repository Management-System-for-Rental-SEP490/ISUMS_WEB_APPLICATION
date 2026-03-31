export function formatDateVi(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export function formatMoneyVND(amount) {
  return `₫${Number(amount || 0).toLocaleString("vi-VN")}`;
}

export function getDaysRemaining(endDate) {
  if (!endDate) return 0;
  const today = new Date();
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return 0;
  const diffTime = end - today;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
