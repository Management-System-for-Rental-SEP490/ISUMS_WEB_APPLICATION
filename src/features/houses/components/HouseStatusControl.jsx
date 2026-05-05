import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Radio, message } from "antd";
import { Wrench, CheckCircle2 } from "lucide-react";
import { updateHouseStatus } from "../api/houses.api";
import { useAuthStore } from "../../auth/store/auth.store";

const ALLOWED_ROLES = ["LANDLORD", "MANAGER"];
const SELECTABLE_STATUSES = ["AVAILABLE", "REPAIRED"];

export default function HouseStatusControl({ house, onUpdated }) {
  const { t } = useTranslation("common");
  const roles = useAuthStore((s) => s.roles ?? []);
  const canEdit = roles.some((r) => ALLOWED_ROLES.includes(r));

  const [open, setOpen] = useState(false);
  const [next, setNext] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!canEdit || !house?.id) return null;

  const current = house.status;
  const isRented = current === "RENTED";

  const openDialog = () => {
    setNext(current === "AVAILABLE" ? "REPAIRED" : "AVAILABLE");
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!next || next === current) {
      setOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      await updateHouseStatus(house.id, next);
      message.success(
        next === "AVAILABLE"
          ? t("houses.statusUpdate.successAvailable")
          : t("houses.statusUpdate.successRepaired"),
      );
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      message.error(err?.message || t("houses.statusUpdate.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={isRented}
        title={isRented ? t("houses.statusUpdate.rentedBlocked") : undefined}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ border: "1px solid #C4DED5", color: "#5A7A6E", background: "#fff" }}
        onMouseEnter={(e) => {
          if (!isRented) {
            e.currentTarget.style.borderColor = "#3bb582";
            e.currentTarget.style.color = "#3bb582";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#C4DED5";
          e.currentTarget.style.color = "#5A7A6E";
        }}
      >
        {current === "REPAIRED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
        {t("houses.statusUpdate.trigger")}
      </button>

      <Modal
        open={open}
        onCancel={() => !submitting && setOpen(false)}
        onOk={handleConfirm}
        confirmLoading={submitting}
        okText={t("houses.statusUpdate.confirm")}
        cancelText={t("houses.statusUpdate.cancel")}
        title={t("houses.statusUpdate.title")}
        okButtonProps={{ disabled: !next || next === current }}
      >
        <p className="text-sm mb-2" style={{ color: "#5A7A6E" }}>
          {t("houses.statusUpdate.current")}:{" "}
          <span className="font-semibold" style={{ color: "#1E2D28" }}>
            {t(`houses.statusCard.${current}`, { defaultValue: current })}
          </span>
        </p>
        {isRented ? (
          <p className="text-xs" style={{ color: "#D95F4B" }}>
            {t("houses.statusUpdate.rentedHint")}
          </p>
        ) : (
          <Radio.Group
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="flex flex-col gap-2 mt-2"
          >
            {SELECTABLE_STATUSES.map((s) => (
              <Radio key={s} value={s} disabled={s === current}>
                {s === "AVAILABLE"
                  ? t("houses.statusUpdate.optionAvailable")
                  : t("houses.statusUpdate.optionRepaired")}
              </Radio>
            ))}
          </Radio.Group>
        )}
      </Modal>
    </>
  );
}
