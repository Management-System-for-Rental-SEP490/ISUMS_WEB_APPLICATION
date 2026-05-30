import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { CalendarDays, Plus, Sparkles } from "lucide-react";

export default function ContractsHeader({ total, onCreate }) {
  const { t } = useTranslation("common");
  const formattedDate = dayjs().format("ddd, DD/MM/YYYY");

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,181,130,0.12)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
          </div>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#3bb582" }}
          >
            {t("contracts.header.subtitle")}
          </span>
        </div>
        <h2
          className="font-heading text-3xl font-bold"
          style={{ color: "#1E2D28" }}
        >
          {t("contracts.header.title")}
        </h2>
        <div
          className="flex flex-wrap items-center gap-3 text-sm"
          style={{ color: "#5A7A6E" }}
        >
          <span
            className="hidden md:inline-block h-1 w-1 rounded-full"
            style={{ background: "#C4DED5" }}
          />
          <span className="inline-flex items-center gap-1 text-xs md:text-sm">
            <CalendarDays className="w-4 h-4" style={{ color: "#3bb582" }} />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div
          className="hidden sm:flex flex-col items-end text-xs"
          style={{ color: "#5A7A6E" }}
        >
          <span>{t("contracts.header.quickAction")}</span>
          <span
            className="text-[11px]"
            style={{ color: "#5A7A6E", opacity: 0.7 }}
          >
            {t("contracts.header.quickActionDesc")}
          </span>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 active:translate-y-[1px]"
          style={{
            background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Plus className="w-3.5 h-3.5" />
          </span>
          <span>{t("contracts.header.createNew")}</span>
        </button>
      </div>
    </div>
  );
}
