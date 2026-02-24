import React from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Banknote,
} from "lucide-react";

export default function ContractsStats({ stats }) {
  const cards = [
    {
      label: "Tổng hợp đồng",
      icon: FileText,
      value: stats.total,
      highlight: "+ Tất cả trạng thái",
      accent: "from-sky-500/10 via-teal-500/5 to-emerald-500/10",
      chipColor: "bg-sky-100 text-sky-700",
    },
    {
      label: "Đang hiệu lực",
      icon: CheckCircle,
      value: stats.active,
      highlight: "Hợp đồng đang chạy",
      accent: "from-emerald-500/10 via-emerald-500/5 to-sky-500/10",
      chipColor: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Chờ duyệt",
      icon: Clock,
      value: stats.pending,
      highlight: "Cần xử lý sớm",
      accent: "from-amber-500/10 via-orange-500/5 to-rose-500/10",
      chipColor: "bg-amber-100 text-amber-700",
    },
    {
      label: "Tổng giá trị",
      icon: Banknote,
      value: `₫${((stats.totalRent || 0) / 1000000).toFixed(1)}M`,
      subLabel: "Giá trị thuê mỗi tháng (ước tính)",
      accent: "from-indigo-500/10 via-sky-500/5 to-teal-500/10",
      chipColor: "bg-indigo-100 text-indigo-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-150"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 -top-10 h-20 bg-gradient-to-r ${card.accent}`}
            />
            <div className="relative p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-md shadow-slate-900/40">
                    <Icon className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {card.label}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${card.chipColor}`}
                >
                  {card.highlight}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
                {card.subLabel && (
                  <p className="text-[11px] text-slate-500">{card.subLabel}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
