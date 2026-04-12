import { useState } from "react";
import { Modal, Select, Button, Input } from "antd";
import { AREA_TYPE_CONFIG } from "./HouseOverviewTab";
import { createFunctionalArea } from "../api/houses.api";

const AREA_TYPE_OPTIONS = Object.entries(AREA_TYPE_CONFIG)
  .filter(([key]) => key !== "default")
  .map(([key, cfg]) => ({ value: key, label: cfg.label }));

const FLOOR_OPTIONS = [
  { value: "0", label: "Tầng trệt" },
  { value: "1", label: "Tầng 1" },
  { value: "2", label: "Tầng 2" },
  { value: "3", label: "Tầng 3" },
  { value: "4", label: "Tầng 4" },
  { value: "5", label: "Tầng 5" },
];

const INITIAL = { name: "", areaType: "BEDROOM", floorNo: "1", description: "" };

export default function AddAreaModal({ houseId, onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Vui lòng nhập tên khu vực.");
    setLoading(true);
    setError(null);
    try {
      await createFunctionalArea({ house: houseId, ...form });
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
      title="Thêm khu vực mới"
      width={480}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ background: "#0d9488", borderColor: "#0d9488" }}
          >
            Thêm khu vực
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Tên khu vực <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: Phòng ngủ 1, Bếp chính..."
            status={error && !form.name.trim() ? "error" : ""}
          />
        </div>

        {/* Type + Floor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại khu vực</label>
            <Select
              value={form.areaType}
              onChange={setVal("areaType")}
              options={AREA_TYPE_OPTIONS}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tầng</label>
            <Select
              value={form.floorNo}
              onChange={setVal("floorNo")}
              options={FLOOR_OPTIONS}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
          <Input.TextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả thêm về khu vực này..."
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
