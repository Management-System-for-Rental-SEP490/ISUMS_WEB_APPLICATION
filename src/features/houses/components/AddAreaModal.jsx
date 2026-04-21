import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Select, Button, Input } from "antd";
import { AREA_TYPE_CONFIG } from "./HouseOverviewTab";
import { createFunctionalArea } from "../api/houses.api";

function buildFloorOptions(numberOfFloors, t) {
  const count = numberOfFloors ?? 3;
  return Array.from({ length: count }, (_, i) => ({
    value: String(i + 1),
    label: t("houses.addArea.floorOption", { n: i + 1 }),
  }));
}

const INITIAL = { name: "", areaType: "BEDROOM", floorNo: "1", description: "", customTypeName: "" };

export default function AddAreaModal({ houseId, numberOfFloors, onClose, onSuccess }) {
  const { t } = useTranslation("common");
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const isOther = form.areaType === "OTHER";
  const floorOptions = buildFloorOptions(numberOfFloors, t);

  const areaTypeOptions = Object.entries(AREA_TYPE_CONFIG)
    .filter(([key]) => key !== "default" && key !== "ALL")
    .map(([key, cfg]) => ({
      value: key,
      label: t(`houses.areaType.${key}`, { defaultValue: cfg.label }),
    }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError(t("houses.addArea.errorName"));
    if (isOther && !form.customTypeName.trim()) return setError(t("houses.addArea.errorCustomType"));
    setLoading(true);
    setError(null);
    try {
      const payload = {
        house: houseId,
        name: form.name,
        areaType: form.areaType,
        floorNo: form.floorNo,
        description: isOther && form.customTypeName.trim()
          ? `[${form.customTypeName.trim()}] ${form.description}`.trim()
          : form.description,
      };
      await createFunctionalArea(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onCancel={onClose}
      title={t("houses.addArea.title")}
      width={480}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("actions.cancel")}</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            {t("houses.addArea.submit")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t("houses.addArea.nameLabel")} <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t("houses.addArea.namePlaceholder")}
            status={error && !form.name.trim() ? "error" : ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("houses.addArea.areaTypeLabel")}</label>
            <Select
              value={form.areaType}
              onChange={(val) => setForm((f) => ({ ...f, areaType: val, customTypeName: "" }))}
              options={areaTypeOptions}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("houses.addArea.floorLabel")}</label>
            <Select
              value={form.floorNo}
              onChange={setVal("floorNo")}
              options={floorOptions}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {isOther && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t("houses.addArea.customTypeLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.customTypeName}
              onChange={(e) => setForm((f) => ({ ...f, customTypeName: e.target.value }))}
              placeholder={t("houses.addArea.customTypePlaceholder")}
              status={error && isOther && !form.customTypeName.trim() ? "error" : ""}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("houses.addArea.descriptionLabel")}</label>
          <Input.TextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t("houses.addArea.descriptionPlaceholder")}
            rows={3}
            style={{ resize: "none" }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </Modal>
  );
}
