import { useMemo, useState } from "react";
import CreateContractWizard from "../components/create/CreateContractWizard";
import { useHouses } from "../../houses/hooks/useHouses";
import { createContract } from "../api/contracts.api";
import { toast } from "react-toastify";
import { LoadingOverlay } from "../../../components/shared/Loading";

const getInitialForm = (todayISO) => ({
  name: "",
  email: "",
  emailChecked: false,
  phoneNumber: "",
  identityNumber: "",
  houseId: "",
  dateOfIssue: "",
  placeOfIssue: "Cục Cảnh sát QLHC về TTXH",
  tenantAddress: "",
  startDate: todayISO,
  endDate: "",
  rentAmount: "",
  payDate: 5,
  payCycle: "monthly",
  depositAmount: "",
  depositDate: "",
  depositRefundDays: 30,
  handoverDate: "",
  lateDays: 3,
  latePenaltyPercent: 5,
  maxLateDays: 10,
  cureDays: 7,
  earlyTerminationPenalty: "",
  landlordBreachCompensation: "",
  renewNoticeDays: 30,
  landlordNoticeDays: 30,
  forceMajeureNoticeHours: 24,
  disputeDays: 30,
  disputeForum: "",
  copies: 2,
  eachKeep: 1,
  purpose: "Để ở",
  area: "",
  structure: "",
  ownershipDocs: "",
  taxFeeNote: "",
});

export default function CreateContract({ onCancel, onCreated }) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialForm = useMemo(() => getInitialForm(todayISO), [todayISO]);
  const { houses } = useHouses();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const houseOptions = useMemo(() => {
    return Array.isArray(houses) ? houses : [];
  }, [houses]);

  const handleCreated = async (form) => {
    setError(null);
    setSubmitting(true);
    try {
      await createContract(form);
      const house = houseOptions.find((h) => h.id === form.houseId);
      onCreated?.({
        id: Date.now(),
        contractNumber: `HD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        tenant: form.name,
        property: house?.name || house?.title || form.houseId || "—",
        unit: house?.unit || "—",
        startDate: form.startDate,
        endDate: form.endDate,
        rent: Number(form.rentAmount) || 0,
        deposit: Number(form.depositAmount) || 0,
        status: "pending",
        paymentType: "monthly",
        autoRenew: true,
      });
      toast.success("Tạo hợp đồng thành công!");
    } catch (err) {
      const msg =
        err?.response?.status === 500
          ? "Tạo hợp đồng lỗi, vui lòng thử lại."
          : err?.response?.data?.message || err?.message || "Không thể tạo hợp đồng";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <LoadingOverlay open={submitting} label="Đang tạo hợp đồng..." />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo Hợp Đồng</h2>
        <p className="text-gray-600">
          Bước 1: Người thuê — Bước 2: Nhà & chi phí — Bước 3: Điều khoản
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition font-bold text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}
      <CreateContractWizard
        initialForm={initialForm}
        onCancel={onCancel}
        onCreated={handleCreated}
        houses={houseOptions}
        disabled={submitting}
      />
    </div>
  );
}
