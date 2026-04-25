import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Save, Pencil } from "lucide-react";
import { updateHouse } from "../api/houses.api";

/**
 * Compact inline editor for legal fields the contract template needs:
 *   - areaM2, structure: shown in HTML property block
 *   - landCertNumber, landCertIssueDate, landCertIssuer: GCN (Giấy chứng nhận
 *     quyền sử dụng đất) — contract references these in the "nguồn gốc nhà" clause
 *
 * All five live on the House entity (one fact per house, shared by every
 * contract signed against it). NULL on houses created before V6/V7 — we treat
 * missing values as a call-to-action, not an error.
 */

const STRUCTURE_LABELS = {
  LEVEL_4: "Nhà cấp 4",
  TUBE_HOUSE: "Nhà ống",
  TOWN_HOUSE: "Nhà phố",
  VILLA: "Biệt thự",
  OTHER: "Khác",
};

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("vi-VN"); } catch { return iso; }
}

export default function HouseLegalFieldsEditor({ house, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    areaM2: house?.areaM2 ?? "",
    structure: house?.structure ?? "",
    landCertNumber: house?.landCertNumber ?? "",
    landCertIssueDate: house?.landCertIssueDate ?? "",
    landCertIssuer: house?.landCertIssuer ?? "",
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      areaM2: house?.areaM2 ?? "",
      structure: house?.structure ?? "",
      landCertNumber: house?.landCertNumber ?? "",
      landCertIssueDate: house?.landCertIssueDate ?? "",
      landCertIssuer: house?.landCertIssuer ?? "",
    });
    setEditing(false);
  }, [house?.id]);

  if (!house?.id) return null;

  const missingBasic = house.areaM2 == null || !house.structure;
  const missingGcn = !house.landCertNumber;
  const missing = missingBasic || missingGcn;

  const save = async () => {
    setSaving(true);
    try {
      await updateHouse(house.id, {
        name: house.name,
        address: house.address,
        regionId: house.regionId,
        ward: house.ward,
        commune: house.commune,
        city: house.city,
        description: house.description,
        numberOfFloors: house.numberOfFloors ?? 0,
        areaM2: form.areaM2 === "" ? null : Number(form.areaM2),
        structure: form.structure || null,
        landCertNumber: form.landCertNumber?.trim() || null,
        landCertIssueDate: form.landCertIssueDate || null,
        landCertIssuer: form.landCertIssuer?.trim() || null,
        houseImages: [],
      });
      toast.success("Đã cập nhật thông tin nhà.");
      setEditing(false);
      onSaved?.();
    } catch (e) {
      toast.error(e?.message ?? "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-3 ${
        missing ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="flex-1 text-sm space-y-1">
          <div className="font-semibold text-slate-700">
            {missing ? "⚠️ Thiếu thông tin pháp lý" : "Thông tin pháp lý"}
          </div>
          <div className="text-slate-600 text-xs">
            Diện tích: <b>{house.areaM2 != null ? `${house.areaM2} m²` : "—"}</b>
            {" · "}
            Kết cấu: <b>{house.structure ? (STRUCTURE_LABELS[house.structure] ?? house.structure) : "—"}</b>
          </div>
          <div className="text-slate-600 text-xs">
            Số GCN: <b>{house.landCertNumber || "—"}</b>
            {" · "}
            Cấp ngày: <b>{fmtDate(house.landCertIssueDate)}</b>
            {" · "}
            Cơ quan cấp: <b>{house.landCertIssuer || "—"}</b>
          </div>
          {missing && (
            <div className="text-[11px] text-amber-700 italic">
              Hợp đồng thuê sẽ không render đầy đủ nếu để trống các trường trên.
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shrink-0"
        >
          <Pencil className="w-3 h-3" />
          Cập nhật
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-300 bg-teal-50/30 p-4 space-y-3">
      <div className="text-sm font-semibold">Cập nhật thông tin pháp lý</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Diện tích (m²)</label>
          <input
            type="number" step="0.01" min="0"
            value={form.areaM2}
            onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
            placeholder="60"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Kết cấu</label>
          <select
            value={form.structure}
            onChange={(e) => setForm({ ...form, structure: e.target.value })}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          >
            <option value="">— Chọn —</option>
            {Object.entries(STRUCTURE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="pt-2 border-t border-teal-200 text-xs font-semibold text-slate-500">
        Giấy chứng nhận quyền sử dụng đất (GCN / Sổ hồng)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Số GCN</label>
          <input
            value={form.landCertNumber}
            onChange={(e) => setForm({ ...form, landCertNumber: e.target.value })}
            placeholder="BA 123456"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Ngày cấp</label>
          <input
            type="date"
            value={form.landCertIssueDate}
            onChange={(e) => setForm({ ...form, landCertIssueDate: e.target.value })}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Cơ quan cấp</label>
          <input
            value={form.landCertIssuer}
            onChange={(e) => setForm({ ...form, landCertIssuer: e.target.value })}
            placeholder="UBND Quận/Huyện..."
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          <Save className="w-3 h-3" />
          {saving ? "Đang lưu…" : "Lưu"}
        </button>
      </div>
    </div>
  );
}
