import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";

/**
 * Map category từ API sang loại hiển thị nội bộ.
 * Thêm category mới từ backend vào đây.
 */
export const CATEGORY_TYPE = {
  CONTRACT_EXPIRED: "Hợp đồng hết hạn",
  INSPECTION_DONE: "Kiểm tra nhà thành công",
  PAYMENT_DUE: "Thanh toán đến hạn",
  PAYMENT_RECEIVED: "Thanh toán nhận được",
};

/**
 * Config hiển thị cho từng loại thông báo.
 */
export const TYPE_CONFIG = {
  critical: {
    icon: React.createElement(XCircle, { className: "w-4 h-4" }),
    iconColor: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-400",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    label: "Khẩn cấp",
  },
  warning: {
    icon: React.createElement(AlertTriangle, { className: "w-4 h-4" }),
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    label: "Cảnh báo",
  },
  info: {
    icon: React.createElement(Info, { className: "w-4 h-4" }),
    iconColor: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    label: "Thông tin",
  },
  success: {
    icon: React.createElement(CheckCircle, { className: "w-4 h-4" }),
    iconColor: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-400",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    label: "Thành công",
  },
};

/**
 * Tab filter hiển thị trên trang danh sách thông báo.
 */
export const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "critical", label: "Khẩn cấp" },
  { key: "warning", label: "Cảnh báo" },
  { key: "info", label: "Thông tin" },
  { key: "success", label: "Thành công" },
];

/**
 * Resolve type hiển thị từ 1 notification object.
 * @param {object} notif
 * @returns {"critical"|"warning"|"info"|"success"}
 */
export function resolveNotifType(notif) {
  const category = notif.category ?? notif.type ?? "";
  const fromCategory = CATEGORY_TYPE[category];
  if (fromCategory) return fromCategory;
  const lower = category.toLowerCase();
  return TYPE_CONFIG[lower] ? lower : "info";
}
