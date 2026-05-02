import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  purpose: "Để ở",
  area: "",
  structure: "",
  ownershipDocs: "",
  taxFeeNote: "",
  hasPowerCutClause: false,
});

export default function CreateContract({ onCancel, onCreated }) {
  const { t } = useTranslation("common");
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialForm = useMemo(() => getInitialForm(todayISO), [todayISO]);
  const { houses } = useHouses();
  const [modalOpen, setModalOpen] = useState(false);
  const [isApiDone, setIsApiDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingForm, setPendingForm] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  const houseOptions = useMemo(() => {
    return Array.isArray(houses) ? houses : [];
  }, [houses]);

  const callCreateApi = async (form) => {
    setIsApiDone(false);
    setIsError(false);
    setErrorMessage("");
    try {
      const result = await createContract(form);
      setCreatedId(result?.id ?? null);
      setIsApiDone(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 400 ? t("contracts.create.err400") :
        status === 404 ? t("contracts.create.err404") :
        t("contracts.create.errGeneric");
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
    toast.success(t("contract.toastCreateSuccess"));
    onCreated?.({ id: createdId });
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
        onClose={() => setModalOpen(false)}
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("contracts.create.title")}</h2>
        <p className="text-gray-600">{t("contracts.create.subtitle")}</p>
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
