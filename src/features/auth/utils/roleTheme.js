import { Crown, ShieldCheck, User } from "lucide-react";

const LANDLORD_THEME = {
  role: "LANDLORD",
  labelKey: "roles.LANDLORD",
  accent: "#D97706",
  badgeBg: "rgba(217,119,6,0.10)",
  badgeBorder: "rgba(217,119,6,0.30)",
  badgeText: "#B45309",
  gradient: "linear-gradient(135deg, #f59e0b 0%, #D97706 100%)",
  icon: Crown,
};

const MANAGER_THEME = {
  role: "MANAGER",
  labelKey: "roles.MANAGER",
  accent: "#2096d8",
  badgeBg: "rgba(32,150,216,0.10)",
  badgeBorder: "rgba(32,150,216,0.30)",
  badgeText: "#1E40AF",
  gradient: "linear-gradient(135deg, #3B82F6 0%, #2096d8 100%)",
  icon: ShieldCheck,
};

const FALLBACK_THEME = {
  role: null,
  labelKey: "roles.user",
  accent: "#5A7A6E",
  badgeBg: "rgba(90,122,110,0.10)",
  badgeBorder: "rgba(90,122,110,0.25)",
  badgeText: "#5A7A6E",
  gradient: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
  icon: User,
};

const RESOLUTION_ORDER = [
  { match: "LANDLORD", theme: LANDLORD_THEME },
  { match: "ADMIN",    theme: { ...LANDLORD_THEME, role: "ADMIN" } },
  { match: "MANAGER",  theme: MANAGER_THEME },
];

export function resolveRoleTheme(roles = []) {
  for (const { match, theme } of RESOLUTION_ORDER) {
    if (roles.includes(match)) return theme;
  }
  return FALLBACK_THEME;
}
