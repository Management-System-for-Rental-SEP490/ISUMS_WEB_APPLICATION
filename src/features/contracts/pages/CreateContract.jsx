import { useMemo, useState } from "react";
import CreateContractWizard from "../components/create/CreateContractWizard";
import ContractLoadingModal from "../components/create/ContractLoadingModal";
import { useHouses } from "../../houses/hooks/useHouses";
import { createContract } from "../api/contracts.api";
import { toast } from "react-toastify";

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
  purpose: "",
  area: "",
  structure: "",
  ownershipDocs: "",
  taxFeeNote: "",
});

export default function CreateContract({ onCancel, onCreated }) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialForm = useMemo(() => getInitialForm(todayISO), [todayISO]);
  const { houses } = useHouses();
  const [modalOpen, setModalOpen] = useState(false);
  const [isApiDone, setIsApiDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingForm, setPendingForm] = useState(null);

  const houseOptions = useMemo(() => {
    return Array.isArray(houses) ? houses : [];
  }, [houses]);

  const callCreateApi = async (form) => {
    setIsApiDone(false);
    setIsError(false);
    setErrorMessage("");
    try {
      await createContract(form);
      setIsApiDone(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400 ? "Dữ liệu không hợp lệ hoặc thông tin chủ nhà chưa được cập nhật đầy đủ." :
        status === 404 ? "Không tìm thấy nhà hoặc email người dùng không tồn tại." :
        "Tạo hợp đồng thất bại, vui lòng thử lại.";
      setIsError(true);
      setErrorMessage(msg);
      setIsApiDone(true);
    }
  };

  const handleCreated = (form) => {
    setPendingForm(form);
    setModalOpen(true);
    callCreateApi(form);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    const form = pendingForm;
    const house = houseOptions.find((h) => h.id === form?.houseId);
    toast.success("Tạo hợp đồng thành công!");
    onCreated?.({
      id: Date.now(),
      contractNumber: `HD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      tenant: form?.name,
      property: house?.name || house?.title || form?.houseId || "—",
      unit: house?.unit || "—",
      startDate: form?.startDate,
      endDate: form?.endDate,
      rent: Number(form?.rentAmount) || 0,
      deposit: Number(form?.depositAmount) || 0,
      status: "pending",
      paymentType: "monthly",
      autoRenew: true,
    });
  };

  const handleRetry = () => {
    if (pendingForm) {
      setModalOpen(true);
      callCreateApi(pendingForm);
    }
  };

  return (
    <div className="space-y-6 relative">
      <ContractLoadingModal
        isOpen={modalOpen}
        isApiDone={isApiDone}
        isError={isError}
        errorMessage={errorMessage}
        onSuccess={handleModalSuccess}
        onRetry={handleRetry}
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo Hợp Đồng</h2>
        <p className="text-gray-600">
          Bước 1: Người thuê — Bước 2: Nhà & chi phí — Bước 3: Điều khoản
        </p>
      </div>
      <CreateContractWizard
        initialForm={initialForm}
        onCancel={onCancel}
        onCreated={handleCreated}
        houses={houseOptions}
        disabled={modalOpen}
      />
    </div>
  );
}
