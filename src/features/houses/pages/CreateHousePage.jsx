import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Save, X } from "lucide-react";
import AddressPicker from "../../../components/shared/AddressPicker";
import HouseImageUploader from "../components/HouseImageUploader";
import HouseRegionSelector from "../components/HouseRegionSelector";
import { createHouse, getRegions, uploadHouseImages } from "../api/houses.api";

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-slate-50 placeholder-slate-400 transition";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

export default function CreateHousePage({ onBack, onSubmit }) {
  const { t } = useTranslation("common");
  const [form, setForm]           = useState({
    name: "", description: "", numberOfFloors: "",
    areaM2: "",      // Used on every contract template — prompt early.
    structure: "",   // HouseStructure enum value.
    // GCN (Giấy chứng nhận quyền sử dụng đất) — rendered into every
    // contract's "nguồn gốc nhà" clause. One fact per house.
    landCertNumber: "",
    landCertIssueDate: "",
    landCertIssuer: "",
  });
  const [address, setAddress]     = useState("");
  const [addrParts, setAddrParts] = useState({ street: "", ward: "", city: "" });
  const [wardName, setWardName]   = useState("");
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
    if (!form.name.trim()) e.name     = t("houses.create.validation.name");
    if (!regionId)         e.regionId = t("houses.create.validation.region");
    if (!address)          e.address  = t("houses.create.validation.address");
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
        ward:          wardName,
        commune:       "",
        city:          addrParts.city,
        description:   form.description,
        numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : 0,
        areaM2:        form.areaM2 !== "" ? Number(form.areaM2) : null,
        structure:     form.structure || null,
        landCertNumber:    form.landCertNumber.trim() || null,
        landCertIssueDate: form.landCertIssueDate || null,
        landCertIssuer:    form.landCertIssuer.trim() || null,
        houseImages:   [],
      };
      const created = await createHouse(payload);
      const houseId = created?.id;
      if (houseId && images.length > 0) {
        await uploadHouseImages(houseId, images.map((img) => img.file));
      }
      toast.success(t("houses.create.successToast"));
      onSubmit?.(created);
    } catch (e) {
      toast.error(e?.message ?? t("houses.create.failToast"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("houses.create.title")}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{t("houses.create.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <X className="w-3.5 h-3.5" />
            {t("actions.cancel")}
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
            {submitting ? t("houses.create.saving") : t("houses.create.save")}
          </button>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Left col: Image upload + Basic info */}
        <div className="lg:col-span-3 space-y-5">
          <div className="relative">
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="text-[10px] font-bold tracking-widest text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full uppercase">
                {t("houses.create.photoLibrary")}
              </span>
            </div>
            <HouseImageUploader onImagesChange={setImages} />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #3bb582, #2096d8)" }} />
              <h3 className="text-sm font-bold text-slate-800">{t("houses.create.basicInfo")}</h3>
            </div>

            <div>
              <label className={lbl}>{t("houses.create.nameLabel")} <span className="text-red-500 normal-case">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder={t("houses.create.namePlaceholder")}
                className={`${inp} ${errors.name ? "border-red-400 bg-red-50" : ""}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>{t("houses.create.floors")}</label>
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
                    {t("houses.create.floorsUnit")}
                  </span>
                </div>
              </div>
              <div>
                <label className={lbl}>Diện tích</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.areaM2}
                    onChange={(e) => setField("areaM2", e.target.value)}
                    placeholder="60"
                    className={inp}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    m²
                  </span>
                </div>
              </div>
              <div>
                <label className={lbl}>Kết cấu</label>
                <select
                  value={form.structure}
                  onChange={(e) => setField("structure", e.target.value)}
                  className={inp}
                >
                  <option value="">— Chọn —</option>
                  <option value="LEVEL_4">Nhà cấp 4</option>
                  <option value="TUBE_HOUSE">Nhà ống</option>
                  <option value="TOWN_HOUSE">Nhà phố</option>
                  <option value="VILLA">Biệt thự</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>{t("houses.create.descriptionLabel")}</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={4}
                placeholder={t("houses.create.descriptionPlaceholder")}
                className={`${inp} resize-none`}
              />
            </div>
          </div>

          {/* Giấy chứng nhận quyền sử dụng đất (GCN) — shared by every
              contract signed against this house. Optional at create time;
              can be backfilled from HouseDetail later. */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #3bb582, #2096d8)" }} />
              <h3 className="text-sm font-bold text-slate-800">Giấy chứng nhận quyền sử dụng đất (Sổ hồng)</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Tùy chọn</span>
            </div>
            <p className="text-xs text-slate-500 -mt-2">
              Các trường này sẽ hiển thị trên hợp đồng thuê. Có thể để trống và cập nhật sau
              ở trang <b>Chi tiết nhà</b>.
            </p>
            <div>
              <label className={lbl}>Số GCN</label>
              <input
                value={form.landCertNumber}
                onChange={(e) => setField("landCertNumber", e.target.value)}
                placeholder="VD: BA 123456"
                className={inp}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Ngày cấp</label>
                <input
                  type="date"
                  value={form.landCertIssueDate}
                  onChange={(e) => setField("landCertIssueDate", e.target.value)}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Cơ quan cấp</label>
                <input
                  value={form.landCertIssuer}
                  onChange={(e) => setField("landCertIssuer", e.target.value)}
                  placeholder="UBND Quận/Huyện..."
                  className={inp}
                />
              </div>
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

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #3bb582, #2096d8)" }} />
              <h3 className="text-sm font-bold text-slate-800">{t("houses.create.addressSection")}</h3>
            </div>
            <AddressPicker
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
              }}
              onPartsChange={(parts) => setAddrParts(parts)}
              onWardChange={(name) => setWardName(name)}
              error={errors.address}
              label={t("houses.create.addressLabel")}
              showMap
            />
          </div>
        </div>
      </div>
    </div>
  );
}
