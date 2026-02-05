export function formatDateVi(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function formatMoneyVND(amount) {
  return `₫${Number(amount || 0).toLocaleString("vi-VN")}`;
}

export function getDaysRemaining(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
