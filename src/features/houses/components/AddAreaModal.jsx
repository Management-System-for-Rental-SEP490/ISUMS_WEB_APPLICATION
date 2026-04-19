import { useState } from "react";
import { Modal, Select, Button, Input } from "antd";
import { AREA_TYPE_CONFIG } from "./HouseOverviewTab";
import { createFunctionalArea } from "../api/houses.api";

// Loại trừ "default" và "ALL" khỏi dropdown (ALL không hợp lý khi tạo khu vực riêng lẻ)
const AREA_TYPE_OPTIONS = Object.entries(AREA_TYPE_CONFIG)
  .filter(([key]) => key !== "default" && key !== "ALL")
  .map(([key, cfg]) => ({ value: key, label: cfg.label }));

function buildFloorOptions(numberOfFloors) {
  const count = numberOfFloors ?? 3;
  return Array.from({ length: count }, (_, i) => ({
    value: String(i + 1),
    label: `Tầng ${i + 1}`,
  }));
}

const INITIAL = { name: "", areaType: "BEDROOM", floorNo: "1", description: "", customTypeName: "" };

export default function AddAreaModal({ houseId, numberOfFloors, onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const isOther = form.areaType === "OTHER";
  const floorOptions = buildFloorOptions(numberOfFloors);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Vui lòng nhập tên khu vực.");
    if (isOther && !form.customTypeName.trim()) return setError("Vui lòng mô tả loại khu vực.");
    setLoading(true);
    setError(null);
    try {
      // Khi OTHER: đưa customTypeName vào description để backend lưu thêm ngữ cảnh
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
              onChange={(val) => setForm((f) => ({ ...f, areaType: val, customTypeName: "" }))}
              options={AREA_TYPE_OPTIONS}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tầng</label>
            <Select
              value={form.floorNo}
              onChange={setVal("floorNo")}
              options={floorOptions}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Custom type name — chỉ hiện khi chọn "Khác" */}
        {isOther && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Loại cụ thể <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.customTypeName}
              onChange={(e) => setForm((f) => ({ ...f, customTypeName: e.target.value }))}
              placeholder="VD: Ban công, Gara xe, Phòng giặt..."
              status={error && isOther && !form.customTypeName.trim() ? "error" : ""}
            />
          </div>
        )}

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
