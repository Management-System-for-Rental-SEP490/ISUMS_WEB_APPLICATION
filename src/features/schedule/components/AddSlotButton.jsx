import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

export default function AddSlotButton() {
  const { t } = useTranslation("common");
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-teal-300 hover:bg-teal-50/40 transition group min-h-[64px]">
      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition">
        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
      </div>
      <span className="text-[10px] text-slate-400 group-hover:text-teal-600 font-medium transition">
        {t("schedule.addJob")}
      </span>
    </div>
  );
}
