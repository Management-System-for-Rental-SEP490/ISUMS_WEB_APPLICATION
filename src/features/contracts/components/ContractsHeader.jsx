import React from "react";
import { CalendarDays, Plus } from "lucide-react";

export default function ContractsHeader({ total, onCreate }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-teal-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 border border-teal-100 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(45,212,191,0.35)]" />
          <span className="text-xs font-medium text-teal-700">ISUMS</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Quản Lý Hợp Đồng
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            Đang theo dõi{" "}
            <span className="font-semibold text-slate-900">{total}</span> hợp
            đồng.
          </span>
          <span className="hidden md:inline-block h-1 w-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1 text-xs md:text-sm text-slate-500">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
          <span>Thao tác nhanh</span>
          <span className="text-[11px] text-slate-400">
            Tạo hợp đồng mới chỉ với vài bước
          </span>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-teal-500/30 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/40 active:translate-y-[1px] transition-all duration-150"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
            <Plus className="w-3.5 h-3.5" />
          </span>
          <span>Tạo Hợp Đồng Mới</span>
        </button>
      </div>
    </div>
  );
}
