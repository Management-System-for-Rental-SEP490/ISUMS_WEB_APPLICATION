import { conditionColor } from "../../constants/inspection.constants";

export default function ConditionBar({ prev, curr }) {
  const diff = (curr ?? 0) - (prev ?? 0);
  const color = conditionColor(curr ?? 0);
  return (
    <div className="space-y-1.5 min-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
          <div className="h-full rounded-full" style={{ width: `${curr ?? 0}%`, background: color }} />
        </div>
        <span className="text-xs font-bold w-8 text-right" style={{ color }}>
          {curr ?? 0}%
        </span>
      </div>
      {prev != null && diff !== 0 && (
        <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
          {diff > 0 ? `▲ +${diff}%` : `▼ ${diff}%`} so với trước
        </p>
      )}
    </div>
  );
}
