import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, CheckCircle, Clock, Banknote } from "lucide-react";

const CARD_CONFIGS = [
  { key: "total",    icon: FileText,    iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582", chipBg: "rgba(59,181,130,0.10)", chipColor: "#3bb582" },
  { key: "active",   icon: CheckCircle, iconBg: "rgba(32,150,216,0.12)", iconColor: "#2096d8", chipBg: "rgba(32,150,216,0.10)", chipColor: "#2096d8" },
  { key: "pending",  icon: Clock,       iconBg: "rgba(217,95,75,0.10)",  iconColor: "#D95F4B", chipBg: "rgba(217,95,75,0.08)",  chipColor: "#D95F4B" },
  { key: "totalRent",icon: Banknote,    iconBg: "rgba(59,181,130,0.12)", iconColor: "#3bb582", chipBg: "rgba(59,181,130,0.10)", chipColor: "#3bb582", isRent: true },
];

export default function ContractsStats({ stats }) {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARD_CONFIGS.map((card) => {
        const Icon = card.icon;
        const raw  = stats[card.key] ?? 0;
        const value = card.isRent ? `₫${(raw / 1000000).toFixed(1)}M` : raw;

        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#FFFFFF",
              border: "1px solid #C4DED5",
              boxShadow: "0 4px 20px -2px rgba(59,181,130,0.10)",
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] pointer-events-none"
              style={{ background: "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)" }}
            />

            <div className="relative p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: card.chipBg, color: card.chipColor }}
                >
                  {t(`contracts.stats.${card.key}Highlight`)}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#5A7A6E" }}>
                  {t(`contracts.stats.${card.key}`)}
                </p>
                <p className="text-3xl font-heading font-bold tracking-tight" style={{ color: "#1E2D28" }}>
                  {value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
