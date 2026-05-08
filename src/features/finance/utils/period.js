import dayjs from "dayjs";

export const PERIOD_PRESETS = {
  THIS_MONTH: "THIS_MONTH",
  LAST_MONTH: "LAST_MONTH",
  THIS_QUARTER: "THIS_QUARTER",
  LAST_6_MONTHS: "LAST_6_MONTHS",
  YEAR_TO_DATE: "YEAR_TO_DATE",
  LAST_YEAR: "LAST_YEAR",
  CUSTOM: "CUSTOM",
};

export function resolvePeriod(preset, customRange) {
  const now = dayjs();
  switch (preset) {
    case PERIOD_PRESETS.THIS_MONTH:
      return { from: now.startOf("month"), to: now.endOf("day") };
    case PERIOD_PRESETS.LAST_MONTH: {
      const last = now.subtract(1, "month");
      return { from: last.startOf("month"), to: last.endOf("month") };
    }
    case PERIOD_PRESETS.THIS_QUARTER: {
      const quarter = Math.floor(now.month() / 3);
      const start = now.month(quarter * 3).startOf("month");
      return { from: start, to: now.endOf("day") };
    }
    case PERIOD_PRESETS.LAST_6_MONTHS:
      return { from: now.subtract(5, "month").startOf("month"), to: now.endOf("day") };
    case PERIOD_PRESETS.YEAR_TO_DATE:
      return { from: now.startOf("year"), to: now.endOf("day") };
    case PERIOD_PRESETS.LAST_YEAR: {
      const last = now.subtract(1, "year");
      return { from: last.startOf("year"), to: last.endOf("year") };
    }
    case PERIOD_PRESETS.CUSTOM:
    default: {
      if (customRange?.from && customRange?.to) {
        return { from: dayjs(customRange.from), to: dayjs(customRange.to) };
      }
      return { from: now.subtract(5, "month").startOf("month"), to: now.endOf("day") };
    }
  }
}

export function toIso(d) {
  return dayjs.isDayjs(d) ? d.toISOString() : dayjs(d).toISOString();
}

export function formatRange(from, to) {
  const f = dayjs(from);
  const t = dayjs(to);
  if (f.isSame(t, "year")) {
    return `${f.format("DD/MM")} → ${t.format("DD/MM/YYYY")}`;
  }
  return `${f.format("DD/MM/YYYY")} → ${t.format("DD/MM/YYYY")}`;
}
