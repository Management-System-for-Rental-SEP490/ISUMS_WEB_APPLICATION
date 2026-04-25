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
    labelKey: "notifications.typeCritical",
  },
  warning: {
    icon: React.createElement(AlertTriangle, { className: "w-4 h-4" }),
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    labelKey: "notifications.typeWarning",
  },
  info: {
    icon: React.createElement(Info, { className: "w-4 h-4" }),
    iconColor: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    labelKey: "notifications.typeInfo",
  },
  success: {
    icon: React.createElement(CheckCircle, { className: "w-4 h-4" }),
    iconColor: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-400",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    labelKey: "notifications.typeSuccess",
  },
};

/**
 * Tab filter hiển thị trên trang danh sách thông báo.
 */
export const FILTER_TABS = [
  { key: "all",      labelKey: "notifications.filterAll"      },
  { key: "critical", labelKey: "notifications.typeCritical"   },
  { key: "warning",  labelKey: "notifications.typeWarning"    },
  { key: "info",     labelKey: "notifications.typeInfo"       },
  { key: "success",  labelKey: "notifications.typeSuccess"    },
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
