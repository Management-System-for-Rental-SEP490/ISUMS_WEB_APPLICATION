import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import AddressPicker from "../../../components/shared/AddressPicker";
import HouseImageUploader from "../components/HouseImageUploader";
import HouseRegionSelector from "../components/HouseRegionSelector";
import { createHouse, getRegions, uploadHouseImages } from "../api/houses.api";

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";
const lbl = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function CreateHousePage({ onBack, onSubmit }) {
  const [form, setForm]         = useState({ name: "", description: "", numberOfFloors: "" });
  const [address, setAddress]   = useState("");
  const [addrParts, setAddrParts] = useState({ street: "", ward: "", city: "" });
  const [regionId, setRegionId] = useState("");
  const [regions, setRegions]   = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [images, setImages]     = useState([]);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRegions()
      .then((data) => setRegions(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setRegions([]))
      .finally(() => setRegionsLoading(false));
  }, []);

  const setField = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name    = "Vui lòng nhập tên bất động sản";
    if (!regionId)         e.regionId = "Vui lòng chọn khu vực";
    if (!address)          e.address  = "Vui lòng chọn địa chỉ";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name:        form.name.trim(),
        address:     addrParts.street,
        regionId,
        ward:        addrParts.ward,
        commune:     "",
        city:        addrParts.city,
        description: form.description,
        numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : 0,
        houseImages: [],
      };
      const created = await createHouse(payload);
      const houseId = created?.id;
      if (houseId && images.length > 0) {
        await uploadHouseImages(houseId, images.map((img) => img.file));
      }
      toast.success("Tạo bất động sản thành công!");
      onSubmit?.();
    } catch (e) {
      toast.error(e?.message ?? "Tạo thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Thêm bất động sản</h2>
            <p className="text-sm text-slate-500 mt-0.5">Điền thông tin để tạo bất động sản mới</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? "Đang lưu..." : "Lưu bất động sản"}
          </button>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Left: Image upload */}
        <div className="lg:col-span-2">
          <HouseImageUploader onImagesChange={setImages} />
        </div>

        {/* Right: Form fields */}
        <div className="lg:col-span-3 space-y-5">

          <HouseRegionSelector
            regions={regions}
            loading={regionsLoading}
            value={regionId}
            onChange={(id) => {
              setRegionId(id);
              setErrors((p) => ({ ...p, regionId: undefined }));
            }}
            error={errors.regionId}
          />

          {/* Thông tin cơ bản */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Thông tin cơ bản</h3>

            <div>
              <label className={lbl}>Tên bất động sản <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: Căn hộ Sunshine Riverside..."
                className={`${inp} ${errors.name ? "border-red-400" : ""}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className={lbl}>Số tầng</label>
              <input
                type="number"
                min={1}
                value={form.numberOfFloors}
                onChange={(e) => setField("numberOfFloors", e.target.value)}
                placeholder="VD: 3"
                className={inp}
              />
            </div>

            <div>
              <label className={lbl}>Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={4}
                placeholder="Mô tả chi tiết về bất động sản..."
                className={`${inp} resize-none`}
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </h3>
            <AddressPicker
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
              }}
              onPartsChange={(parts) => setAddrParts(parts)}
              error={errors.address}
              label="Địa chỉ bất động sản"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
