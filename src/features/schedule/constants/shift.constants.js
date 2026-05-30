import { Settings, Wrench, ClipboardCheck } from "lucide-react";

export const JOB_TYPES = [
  { value: "ISSUE",       icon: Settings,      color: "orange" },
  { value: "MAINTENANCE", icon: Wrench,         color: "teal"   },
  { value: "INSPECTION",  icon: ClipboardCheck, color: "purple" },
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
  { id: 1, labelKey: "schedule.step1Label" },
  { id: 2, labelKey: "schedule.step2Label" },
  { id: 3, labelKey: "schedule.step3Label" },
];
