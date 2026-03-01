export const STATUS_BADGE = {
  DRAFT: "bg-gray-100 text-gray-700",

  CONFIRM: "bg-blue-100 text-blue-700",

  READY: "bg-amber-100 text-amber-700",

  IN_PROGRESS: "bg-yellow-100 text-yellow-700",

  COMPLETED: "bg-green-100 text-green-700",

  CORRECTING: "bg-orange-100 text-orange-700",

  CANCELLED: "bg-red-100 text-red-700",

  DELETED: "bg-zinc-200 text-zinc-700",

  REJECTED: "bg-rose-100 text-rose-700",
};

export const STATUS_LABEL = {
  DRAFT: "Bản nháp",
  READY: "Đang chờ chủ nhà ký",
  IN_PROGRESS: "Đang chờ khách hàng ký",
  CONFIRM: "Khách hàng đã xác nhận", // Chờ khách hàng ký
  COMPLETED: "Đã hoàn thành", // Khách hảng ký thành công
  REJECTED_BY_TENANT: "Đã bị từ chối bởi khách hàng", // Khách hàng từ chối ký
  CANCELLED: "Đã hủy",
  REJECTED: "Đã từ chối",
};

export const PAYMENT_LABEL = {
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
  yearly: "Hàng năm",
};
