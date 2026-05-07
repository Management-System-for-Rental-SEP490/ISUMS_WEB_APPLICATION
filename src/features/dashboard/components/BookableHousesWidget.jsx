import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowUpRight, Home } from "lucide-react";
import dayjs from "dayjs";
import { getDepositBookableHouses } from "../../contracts/api/contracts.api";

const BRAND_AMBER = "#f59e0b";
const BRAND_AMBER_BG = "rgba(245,158,11,0.10)";

function daysUntil(iso) {
  if (!iso) return null;
  const target = dayjs(iso).startOf("day");
  const today = dayjs().startOf("day");
  return target.diff(today, "day");
}

export default function BookableHousesWidget() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDepositBookableHouses()
      .then((res) => {
        if (cancelled) return;
        const arr = Array.isArray(res) ? res : (res?.items ?? []);
        const sorted = [...arr].sort((a, b) => {
          const aa = a.availableFrom ? new Date(a.availableFrom).getTime() : 0;
          const bb = b.availableFrom ? new Date(b.availableFrom).getTime() : 0;
          return aa - bb;
        });
        setItems(sorted);
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const count = items.length;
  const topItems = useMemo(() => items.slice(0, 5), [items]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid rgba(245,158,11,0.28)", boxShadow: "0 1px 3px 0 rgba(16,24,40,0.08)" }}
    >
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)" }} />
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(245,158,11,0.20)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: BRAND_AMBER_BG }}
            >
              <Clock className="w-5 h-5" style={{ color: BRAND_AMBER }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: "#5A7A6E" }}>
                {t("dashboard.bookableWidget.title")}
              </p>
              {loading ? (
                <div className="h-7 w-12 mt-1 rounded animate-pulse" style={{ background: "#FEF3C7" }} />
              ) : (
                <p className="text-2xl font-bold leading-tight" style={{ color: "#1E2D28" }}>
                  {count}
                  <span className="text-sm font-medium ml-1.5" style={{ color: "#5A7A6E" }}>
                    {t("dashboard.bookableWidget.unit")}
                  </span>
                </p>
              )}
            </div>
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={() => navigate("/houses")}
              className="inline-flex items-center gap-1 text-xs font-semibold transition flex-shrink-0"
              style={{ color: BRAND_AMBER }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t("dashboard.bookableWidget.viewAll")}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!loading && count === 0 && (
        <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
          <Home className="w-8 h-8" style={{ color: "#C4DED5" }} />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            {t("dashboard.bookableWidget.empty")}
          </p>
        </div>
      )}

      {!loading && count > 0 && (
        <ul className="divide-y" style={{ borderColor: "rgba(196,222,213,0.5)" }}>
          {topItems.map((h) => {
            const days = daysUntil(h.availableFrom);
            const dateStr = h.availableFrom ? dayjs(h.availableFrom).format("DD/MM/YYYY") : "—";
            const addrParts = [h.houseAddress, h.ward, h.commune, h.city].filter(Boolean).join(", ");
            return (
              <li key={h.houseId} className="px-5 py-3 flex items-center gap-3 transition-colors hover:bg-amber-50/40">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1E2D28" }}>
                    {h.houseName}
                  </p>
                  {addrParts && (
                    <p className="text-xs truncate" style={{ color: "#5A7A6E" }}>{addrParts}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: BRAND_AMBER }}>
                    {days != null && days > 0
                      ? t("dashboard.bookableWidget.daysLeft", { days })
                      : t("dashboard.bookableWidget.now")}
                  </p>
                  <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{dateStr}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
