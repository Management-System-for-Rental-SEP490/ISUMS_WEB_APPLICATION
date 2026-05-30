import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SHIFT_STEPS } from "../../constants/shift.constants";

export default function StepIndicator({ current }) {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center gap-0">
      {SHIFT_STEPS.map((s, idx) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0",
                  done ? "bg-teal-500 text-white" : active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${active ? "text-teal-700" : done ? "text-teal-500" : "text-slate-400"}`}>
                {t(s.labelKey)}
              </span>
            </div>
            {idx < SHIFT_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${done ? "bg-teal-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
