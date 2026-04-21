import { useTranslation } from "react-i18next";

export default function SignContractHeader({ contract, id }) {
  const { t } = useTranslation("common");

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm z-30 flex-shrink-0">
      <div className="h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">ISUMS</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{t("contracts.signing.subtitle")}</div>
          </div>
        </div>
        {contract && (
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{t("contracts.signing.contractCode")}</div>
            <div className="text-sm font-mono font-bold text-slate-700">
              #{contract.contractNumber ?? contract.name ?? id}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
