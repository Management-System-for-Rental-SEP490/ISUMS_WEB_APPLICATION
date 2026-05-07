import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateContractWizard from "../components/create/CreateContractWizard";
import ContractLoadingModal from "../components/create/ContractLoadingModal";
import { useHouses } from "../../houses/hooks/useHouses";
import { createContract, getDepositBookableHouses, getLockedHouseIds } from "../api/contracts.api";
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
  depositRefundDays: 30,
  lateDays: 3,
  latePenaltyPercent: 5,
  maxLateDays: 10,
  cureDays: 7,
  earlyTerminationPenalty: "",
  landlordBreachCompensation: "",
  renewNoticeDays: 30,
  landlordNoticeDays: 30,
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
  const { houses: vacantHouses } = useHouses({ status: "AVAILABLE", size: 100 });
  const [bookable, setBookable] = useState([]);
  const [lockedIds, setLockedIds] = useState(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [isApiDone, setIsApiDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingForm, setPendingForm] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDepositBookableHouses().catch(() => []),
      getLockedHouseIds().catch(() => []),
    ]).then(([bookableRes, lockedRes]) => {
      if (cancelled) return;
      const arr = Array.isArray(bookableRes) ? bookableRes : (bookableRes?.items ?? []);
      setBookable(arr);
      const lockedArr = Array.isArray(lockedRes) ? lockedRes : (lockedRes?.items ?? []);
      setLockedIds(new Set(lockedArr));
    });
    return () => { cancelled = true; };
  }, []);

  const houseOptions = useMemo(() => {
    const vacant = (Array.isArray(vacantHouses) ? vacantHouses : [])
      .filter((h) => !lockedIds.has(h.id))
      .map((h) => ({
        id: h.id,
        name: h.name || h.title,
        address: h.address,
        category: "AVAILABLE_NOW",
        availableFrom: null,
        currentContractEndAt: null,
      }));
    const booked = (Array.isArray(bookable) ? bookable : [])
      .filter((h) => !lockedIds.has(h.houseId))
      .map((h) => ({
        id: h.houseId,
        name: h.houseName,
        address: [h.houseAddress, h.ward, h.commune, h.city].filter(Boolean).join(", "),
        category: "DEPOSIT_BOOKABLE",
        availableFrom: h.availableFrom,
        currentContractEndAt: h.currentContractEndAt,
      }));
    return [...vacant, ...booked];
  }, [vacantHouses, bookable, lockedIds]);

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
