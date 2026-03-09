export const STATUS_BADGE = {
  // Bản nháp — xám trung tính
  DRAFT: "bg-slate-100 text-slate-600 border border-slate-200",

  // Đang chờ chủ nhà xem & xác nhận — xanh dương nhạt
  READY: "bg-blue-50 text-blue-700 border border-blue-200",

  // Chủ nhà đã xác nhận, chờ ký — tím nhạt
  CONFIRM_BY_LANDLORD: "bg-violet-50 text-violet-700 border border-violet-200",

  // Đang chờ khách hàng ký — vàng cam
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",

  // Khách hàng đã xác nhận, chờ ký — cyan
  CONFIRM_BY_TENANT: "bg-cyan-50 text-cyan-700 border border-cyan-200",

  // Đã hoàn thành — xanh lá
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",

  // Đang sửa — cam
  CORRECTING: "bg-orange-50 text-orange-700 border border-orange-200",

  // Bị từ chối bởi khách hàng — đỏ nhạt
  REJECTED_BY_TENANT: "bg-red-50 text-red-600 border border-red-200",

  // Bị từ chối bởi chủ nhà — hồng đậm
  REJECTED_BY_LANDLORD: "bg-rose-50 text-rose-700 border border-rose-200",

  // Đã huỷ — xám đậm
  CANCELLED: "bg-zinc-100 text-zinc-600 border border-zinc-200",

  // Đã xoá — xám mờ
  DELETED: "bg-zinc-50 text-zinc-400 border border-zinc-200",
};

export const STATUS_LABEL = {
  DRAFT:                "Bản nháp",
  READY:                "Chờ chủ nhà xác nhận",
  CONFIRM_BY_LANDLORD:  "Chủ nhà đã xác nhận, chờ ký",
  IN_PROGRESS:          "Đang chờ khách hàng ký",
  CONFIRM_BY_TENANT:    "Khách hàng đã đồng ý ký",
  COMPLETED:            "Đã hoàn thành",
  CORRECTING:           "Đang sửa",
  CANCELLED:            "Đã huỷ",
  REJECTED_BY_TENANT:   "Khách hàng từ chối ký",
  REJECTED_BY_LANDLORD: "Chủ nhà từ chối ký",
};

export const PAYMENT_LABEL = {
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
  yearly: "Hàng năm",
};
