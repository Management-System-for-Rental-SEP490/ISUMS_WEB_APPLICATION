export const ISSUE_TYPE_CONFIG = {
  REPAIR:   { label: "Sửa chữa", cls: "bg-orange-100 text-orange-700" },
  QUESTION: { label: "Câu hỏi",  cls: "bg-blue-100 text-blue-700" },
};

export const ISSUE_STATUS_CONFIG = {
  CREATED:                  { label: "Mới tạo",        dot: "bg-slate-400",  pill: "bg-slate-50 text-slate-600 border border-slate-200" },
  WAITING_PAYMENT:          { label: "Chờ thanh toán", dot: "bg-amber-500",  pill: "bg-amber-50 text-amber-700 border border-amber-200" },
  WAITING_MANAGER_APPROVAL: { label: "Chờ duyệt",      dot: "bg-purple-500", pill: "bg-purple-50 text-purple-700 border border-purple-200" },
  SCHEDULED:                { label: "Đang xử lý",     dot: "bg-blue-500",   pill: "bg-blue-50 text-blue-700 border border-blue-200" },
  DONE:                     { label: "Hoàn thành",     dot: "bg-teal-500",   pill: "bg-teal-50 text-teal-700 border border-teal-200" },
};

export const IN_PROGRESS_STATUSES = ["WAITING_PAYMENT", "WAITING_MANAGER_APPROVAL", "SCHEDULED"];

export const ISSUE_STATUS_OPTIONS = Object.entries(ISSUE_STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const ISSUE_TYPE_OPTIONS = Object.entries(ISSUE_TYPE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
