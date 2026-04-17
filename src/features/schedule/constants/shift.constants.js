import { Settings, Wrench, ClipboardCheck } from "lucide-react";

export const JOB_TYPES = [
  {
    value: "ISSUE",
    label: "Sửa chữa",
    desc: "Xử lý sự cố và hư hỏng thiết bị",
    icon: Settings,
    color: "orange",
  },
  {
    value: "MAINTENANCE",
    label: "Bảo trì",
    desc: "Kiểm tra định kỳ và nâng cấp",
    icon: Wrench,
    color: "teal",
  },
  {
    value: "INSPECTION",
    label: "Kiểm tra nhà",
    desc: "Kiểm tra tình trạng nhà trước và sau khi cho thuê",
    icon: ClipboardCheck,
    color: "purple",
  },
];

export const TYPE_COLORS = {
  orange: {
    bar: "bg-orange-400",
    active: "text-orange-600 font-semibold",
    badge: "bg-orange-100 text-orange-600",
  },
  teal: {
    bar: "bg-teal-500",
    active: "text-teal-700 font-semibold",
    badge: "bg-teal-100 text-teal-700",
  },
  purple: {
    bar: "bg-purple-400",
    active: "text-purple-600 font-semibold",
    badge: "bg-purple-100 text-purple-600",
  },
};

export const SHIFT_STEPS = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Thời gian" },
  { id: 3, label: "Xác nhận" },
];
