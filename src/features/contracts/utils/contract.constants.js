export const STATUS_BADGE = {
  DRAFT: "bg-slate-100 text-slate-600 border border-slate-200",
  PENDING_TENANT_REVIEW: "bg-sky-50 text-sky-700 border border-sky-200",
  CORRECTING: "bg-orange-50 text-orange-700 border border-orange-200",
  READY: "bg-blue-50 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED_BY_TENANT: "bg-red-50 text-red-600 border border-red-200",
  CANCELLED_BY_LANDLORD: "bg-rose-50 text-rose-700 border border-rose-200",
  // legacy — giữ lại để tương thích với data cũ
  CONFIRM_BY_LANDLORD: "bg-violet-50 text-violet-700 border border-violet-200",
  CONFIRM_BY_TENANT: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  REJECTED_BY_TENANT: "bg-red-50 text-red-600 border border-red-200",
  REJECTED_BY_LANDLORD: "bg-rose-50 text-rose-700 border border-rose-200",
  PENDING_TERMINATION: "bg-purple-50 text-purple-700 border border-purple-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  DELETED: "bg-zinc-50 text-zinc-400 border border-zinc-200",
};

export const STATUS_LABEL = {
  DRAFT: "Bản nháp",
  PENDING_TENANT_REVIEW: "Chờ khách thuê xác nhận",
  CORRECTING: "Đang hiệu chỉnh",
  READY: "Chờ chủ nhà ký",
  IN_PROGRESS: "Chờ khách thuê ký",
  COMPLETED: "Đã hoàn thành",
  CANCELLED_BY_TENANT: "Khách thuê đã huỷ",
  CANCELLED_BY_LANDLORD: "Chủ nhà đã huỷ",
  // legacy
  CONFIRM_BY_LANDLORD: "Chủ nhà đã xác nhận, chờ ký",
  CONFIRM_BY_TENANT: "Khách hàng đã đồng ý ký",
  REJECTED_BY_TENANT: "Khách hàng từ chối ký",
  REJECTED_BY_LANDLORD: "Chủ nhà từ chối ký",
  PENDING_TERMINATION: "Sắp kết thúc hợp đồng",
  CANCELLED: "Đã huỷ",
};

export const PAYMENT_LABEL = {
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
  yearly: "Hàng năm",
};
