import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff } from "lucide-react";
import { message } from "antd";
import { isSubscribedToHouse, subscribeToHouse, unsubscribeFromHouse } from "../api/houses.api";

export default function HouseSubscribeButton({ houseId, houseStatus }) {
  const { t } = useTranslation("common");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const eligible = houseStatus === "RENTED" || houseStatus === "REPAIRED";

  useEffect(() => {
    if (!houseId || !eligible) return;
    let cancelled = false;
    isSubscribedToHouse(houseId)
      .then((res) => { if (!cancelled) setSubscribed(Boolean(res)); })
      .catch(() => { if (!cancelled) setSubscribed(false); });
    return () => { cancelled = true; };
  }, [houseId, eligible]);

  if (!eligible || !houseId) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromHouse(houseId);
        setSubscribed(false);
        message.success(t("houses.subscribe.unsubscribed"));
      } else {
        await subscribeToHouse(houseId);
        setSubscribed(true);
        message.success(t("houses.subscribe.subscribed"));
      }
    } catch (err) {
      message.error(err?.message || t("houses.subscribe.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition disabled:opacity-50"
      style={{
        border: subscribed ? "1px solid #3bb582" : "1px solid #C4DED5",
        color: subscribed ? "#3bb582" : "#5A7A6E",
        background: subscribed ? "rgba(59,181,130,0.08)" : "#fff",
      }}
    >
      {subscribed ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
      {subscribed ? t("houses.subscribe.unsubscribe") : t("houses.subscribe.subscribe")}
    </button>
  );
}
