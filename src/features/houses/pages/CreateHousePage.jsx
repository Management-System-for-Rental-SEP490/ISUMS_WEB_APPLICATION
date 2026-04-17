import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save, X } from "lucide-react";
import AddressPicker from "../../../components/shared/AddressPicker";
import HouseImageUploader from "../components/HouseImageUploader";
import HouseRegionSelector from "../components/HouseRegionSelector";
import { createHouse, getRegions, uploadHouseImages } from "../api/houses.api";

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

export default function CreateHousePage({ onBack, onSubmit }) {
  const [form, setForm]           = useState({ name: "", description: "", numberOfFloors: "" });
  const [address, setAddress]     = useState("");
  const [addrParts, setAddrParts] = useState({ street: "", ward: "", city: "" });
  const [regionId, setRegionId]   = useState("");
  const [regions, setRegions]     = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [images, setImages]       = useState([]);
  const [errors, setErrors]       = useState({});
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
    if (!form.name.trim()) e.name     = "Vui lòng nhập tên bất động sản";
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
        name:          form.name.trim(),
        address:       addrParts.street,
        regionId,
        ward:          addrParts.ward,
        commune:       "",
        city:          addrParts.city,
        description:   form.description,
        numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : 0,
        houseImages:   [],
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thêm bất động sản mới</h2>
          <p className="text-sm text-slate-400 mt-0.5">Điền đầy đủ thông tin để tạo bất động sản mới</p>
        </div>

        <div className="flex items-center gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {submitting ? "Đang lưu..." : "Lưu bất động sản"}
          </button>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Left col: Image upload + Basic info */}
        <div className="lg:col-span-3 space-y-5">
          {/* Image uploader with badge */}
          <div className="relative">
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="text-[10px] font-bold tracking-widest text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full uppercase">
                Thư viện ảnh
              </span>
            </div>
            <HouseImageUploader onImagesChange={setImages} />
          </div>

          {/* Thông tin cơ bản */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #3bb582, #2096d8)" }} />
              <h3 className="text-sm font-bold text-slate-800">Thông tin cơ bản</h3>
            </div>

            <div>
              <label className={lbl}>Tên bất động sản <span className="text-red-500 normal-case">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: Căn hộ Penthouse Sky Villa"
                className={`${inp} ${errors.name ? "border-red-400 bg-red-50" : ""}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Số tầng</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={form.numberOfFloors}
                    onChange={(e) => setField("numberOfFloors", e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    Tầng
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className={lbl}>Mô tả chi tiết</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={4}
                placeholder="Mô tả các đặc điểm nổi bật, tiện ích xung quanh..."
                className={`${inp} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Right col: Region + Address */}
        <div className="lg:col-span-2 space-y-5">
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

          {/* Địa chỉ + Map */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #3bb582, #2096d8)" }} />
              <h3 className="text-sm font-bold text-slate-800">Địa chỉ</h3>
            </div>
            <AddressPicker
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
              }}
              onPartsChange={(parts) => setAddrParts(parts)}
              error={errors.address}
              label="Địa chỉ bất động sản"
              showMap
            />
          </div>
        </div>
      </div>
    </div>
  );
}
