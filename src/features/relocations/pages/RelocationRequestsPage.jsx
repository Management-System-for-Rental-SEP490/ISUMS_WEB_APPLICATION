import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  FilePlus2,
  Home,
  ReceiptText,
  RefreshCw,
  Search,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { DatePicker, Input, InputNumber, Modal, Select, Spin, Upload } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAllHouses } from "../../houses/api/houses.api";
import {
  cancelRelocationByManager,
  confirmRelocationHandover,
  createReplacementContract,
  getRelocationRequests,
  reportLandlordFaultRelocation,
  reviewRelocationRequest,
  searchSignedContracts,
} from "../api/relocations.api";

const FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "REQUESTED", label: "Chờ duyệt" },
  { key: "QUOTED", label: "Chờ khách" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "CONTRACT_CREATED", label: "Đã tạo HĐ" },
  { key: "ADDITIONAL_PAYMENT_PENDING", label: "Chờ thu thêm" },
  { key: "REFUND_PENDING", label: "Chờ hoàn" },
  { key: "COMPLETED", label: "Hoàn tất" },
  { key: "REJECTED", label: "Từ chối" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const STATUS_META = {
  REQUESTED: { label: "Chờ duyệt", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  QUOTED: { label: "Chờ khách xác nhận", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  APPROVED: { label: "Đã duyệt", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", tone: "bg-rose-50 text-rose-700 border-rose-200" },
  CONTRACT_CREATED: { label: "Đã tạo HĐ", tone: "bg-sky-50 text-sky-700 border-sky-200" },
  ADDITIONAL_PAYMENT_PENDING: { label: "Chờ thu thêm", tone: "bg-orange-50 text-orange-700 border-orange-200" },
  REFUND_PENDING: { label: "Chờ hoàn tiền", tone: "bg-violet-50 text-violet-700 border-violet-200" },
  COMPLETED: { label: "Hoàn tất", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  CANCELLED: { label: "Đã hủy", tone: "bg-slate-100 text-slate-500 border-slate-200" },
};

const DEPOSIT_STATUS_META = {
  UNPAID: "Chưa cọc",
  PENDING: "Chờ thanh toán",
  PAID: "Đã cọc",
  TRANSFERRED: "Đã chuyển cọc",
  PARTIALLY_TRANSFERRED: "Chuyển một phần",
  FORFEITED: "Giữ cọc",
  REFUNDED: "Đã hoàn",
};

const HANDLING_OPTIONS = [
  { value: "CANCEL_PENDING_DEPOSIT", label: "Hủy invoice cọc cũ" },
  { value: "TRANSFER_TO_REPLACEMENT", label: "Chuyển cọc sang HĐ mới" },
  { value: "PARTIAL_TRANSFER", label: "Chuyển một phần cọc" },
  { value: "FORFEIT", label: "Giữ cọc theo điều khoản" },
  { value: "REFUND_TO_TENANT", label: "Hoàn cọc cho khách" },
];

const HOUSE_PAGE_SIZE = 100;
const RESOLUTION_OPTIONS = [
  { value: "REPLACE_HOUSE", label: "Đổi sang nhà thay thế" },
  { value: "REFUND_TERMINATE", label: "Hoàn tiền và chấm dứt" },
];

const KIND_META = {
  PRE_HANDOVER_TENANT_REQUEST: {
    label: "Trước bàn giao",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  ACTIVE_LEASE_TENANT_UPGRADE: {
    label: "Đang thuê đổi nhà",
    tone: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  LANDLORD_FAULT_UNINHABITABLE: {
    label: "Nhà không ở được",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function shortId(value) {
  if (!value) return "-";
  return String(value).slice(0, 8).toUpperCase();
}

function displayContractNumber(request) {
  return request?.oldContractNumber || shortId(request?.oldContractId);
}

function evidenceItems(value) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function evidenceName(value) {
  const last = String(value).split("/").filter(Boolean).pop();
  return last || value;
}

const CLOUDFRONT_DOMAIN = "isums.pro";

function evidenceUrl(value) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${CLOUDFRONT_DOMAIN}/${v.replace(/^\/+/, "")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeHouseItems(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.content ?? data?.houses ?? [];
}

function totalPagesOf(data) {
  const value = Number(data?.totalPages ?? data?.totalPage ?? data?.pages ?? data?.page?.totalPages ?? 1);
  return Number.isFinite(value) && value > 1 ? Math.floor(value) : 1;
}

function houseIdOf(house) {
  return house?.id ?? house?.houseId ?? house?.uuid;
}

function houseLabelOf(house) {
  const id = houseIdOf(house);
  return house?.name || house?.houseName || house?.address || house?.code || shortId(id);
}

function toDateValue(value) {
  return value ? dayjs(value) : null;
}

function toIso(value) {
  return value ? value.startOf("day").toISOString() : null;
}

function isPaidDeposit(status) {
  return ["PAID", "TRANSFERRED", "PARTIALLY_TRANSFERRED"].includes(status);
}

function isActiveLeaseRequest(request) {
  return request?.requestKind === "ACTIVE_LEASE_TENANT_UPGRADE";
}

async function getRelocationHouseOptions() {
  const firstPage = await getAllHouses({ page: 1, size: HOUSE_PAGE_SIZE });
  const totalPages = totalPagesOf(firstPage);
  const pages = [firstPage];

  if (totalPages > 1) {
    const restPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getAllHouses({ page: index + 2, size: HOUSE_PAGE_SIZE }),
      ),
    );
    pages.push(...restPages);
  }

  const byId = new Map();
  pages.flatMap(normalizeHouseItems).forEach((house) => {
    const id = houseIdOf(house);
    if (id && !byId.has(id)) byId.set(id, house);
  });
  return Array.from(byId.values());
}

function buildInitialForm(request) {
  const isLandlordFault = request?.faultParty === "LANDLORD";
  const resolutionType =
    request?.resolutionType ||
    (isLandlordFault && !request?.requestedHouseId ? "REFUND_TERMINATE" : "REPLACE_HOUSE");
  return {
    resolutionType,
    approvedHouseId: request?.approvedHouseId || request?.requestedHouseId || null,
    depositHandling:
      request?.depositHandling ||
      (resolutionType === "REFUND_TERMINATE"
        ? (isPaidDeposit(request?.depositStatusSnapshot) ? "REFUND_TO_TENANT" : "CANCEL_PENDING_DEPOSIT")
        : (isPaidDeposit(request?.depositStatusSnapshot)
            ? "TRANSFER_TO_REPLACEMENT"
            : "CANCEL_PENDING_DEPOSIT")),
    newRentAmount: request?.newRentAmount ?? null,
    newDepositAmount: request?.newDepositAmount ?? request?.depositAmount ?? 0,
    newStartAt: toDateValue(request?.newStartAt),
    newEndAt: toDateValue(request?.newEndAt),
    newHandoverDate: toDateValue(request?.newHandoverDate),
    transferredDepositAmount: request?.transferredDepositAmount ?? 0,
    forfeitAmount: request?.forfeitAmount ?? 0,
    additionalDepositAmount: request?.additionalDepositAmount ?? 0,
    oldRentProratedAmount: request?.oldRentProratedAmount ?? 0,
    oldUtilitiesAmount: request?.oldUtilitiesAmount ?? 0,
    oldDamageAmount: request?.oldDamageAmount ?? 0,
    adminFeeAmount: request?.adminFeeAmount ?? 0,
    settlementAmount: request?.settlementAmount ?? 0,
    refundableDepositAmount: request?.refundableDepositAmount ?? request?.depositAmount ?? 0,
    totalAdditionalPaymentAmount: request?.totalAdditionalPaymentAmount ?? 0,
    inspectionNote: request?.inspectionNote ?? "",
    refundAmount: request?.refundAmount ?? request?.depositAmount ?? 0,
    refundDueAt: toDateValue(request?.refundDueAt),
    legalBasis: request?.legalBasis ?? "",
    managerNote: request?.managerNote ?? "",
  };
}

function buildInitialReportForm() {
  return {
    contractNumber: "",
    recommendedHouseId: null,
    reportReason: "",
    evidenceFiles: [],
  };
}

export default function RelocationRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [houses, setHouses] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [form, setForm] = useState(buildInitialForm(null));
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState(buildInitialReportForm());
  const [contractOptions, setContractOptions] = useState([]);
  const [contractSearching, setContractSearching] = useState(false);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = useState(null);

  const houseOptions = useMemo(
    () =>
      houses
        .map((house) => {
          const id = houseIdOf(house);
          return id ? { value: id, label: houseLabelOf(house) } : null;
        })
        .filter(Boolean),
    [houses],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestData, houseData] = await Promise.all([
        getRelocationRequests(),
        getRelocationHouseOptions(),
      ]);
      setRequests(requestData);
      setHouses(houseData);
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu đổi nhà.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const searchReportContracts = useCallback(async (searchText = "") => {
    setContractSearching(true);
    try {
      const items = await searchSignedContracts(searchText);
      const options = items
        .map((contract) => {
          const number = contract.documentNo || contract.documentId;
          if (!number) return null;
          const tenant = contract.tenantName || contract.name || "Chưa có tên khách";
          return {
            value: number,
            searchText: `${number} ${tenant}`.toLowerCase(),
            label: (
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{number}</span>
                <span className="text-xs text-slate-500">
                  {tenant} · {formatDate(contract.startAt)} - {formatDate(contract.endAt)}
                </span>
              </div>
            ),
          };
        })
        .filter(Boolean);
      setContractOptions(options);
    } catch {
      setContractOptions([]);
    } finally {
      setContractSearching(false);
    }
  }, []);

  useEffect(() => {
    if (reportOpen) searchReportContracts("");
  }, [reportOpen, searchReportContracts]);

  const filteredRequests = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    return requests.filter((request) => {
      const statusMatched = filter === "ALL" || request.status === filter;
      if (!statusMatched) return false;
      if (!term) return true;
      return [
        request.id,
        request.oldContractId,
        request.oldContractNumber,
        request.tenantId,
        request.oldHouseId,
        request.requestedHouseId,
        request.newContractId,
        request.newContractNumber,
        request.tenantReason,
        request.staffReportReason,
        request.faultParty,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [filter, keyword, requests]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      requested: requests.filter((r) => r.status === "REQUESTED").length,
      quoted: requests.filter((r) => r.status === "QUOTED").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      refundPending: requests.filter((r) => r.status === "REFUND_PENDING").length,
      completed: requests.filter((r) => r.status === "COMPLETED").length,
    }),
    [requests],
  );

  const openReview = (request) => {
    setActiveRequest(request);
    setForm(buildInitialForm(request));
  };

  const closeReview = () => {
    if (submitting) return;
    setActiveRequest(null);
  };

  const patchForm = (patch) => setForm((current) => ({ ...current, ...patch }));
  const patchReportForm = (patch) =>
    setReportForm((current) => ({ ...current, ...patch }));

  const submitStaffReport = async () => {
    const contractNumber = reportForm.contractNumber.trim();
    const files = reportForm.evidenceFiles
      .map((file) => file.originFileObj || file)
      .filter(Boolean);
    if (!contractNumber || !reportForm.reportReason.trim() || files.length === 0) return;

    setSubmitting(true);
    try {
      await reportLandlordFaultRelocation({
        contractNumber,
        recommendedHouseId: reportForm.recommendedHouseId || null,
        reportReason: reportForm.reportReason.trim(),
        evidenceFiles: files,
      });
      toast.success("Đã tạo biên bản nhà không đủ điều kiện.");
      setReportOpen(false);
      setReportForm(buildInitialReportForm());
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không tạo được biên bản.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async (approved) => {
    if (!activeRequest) return;
    setSubmitting(true);
    try {
      await reviewRelocationRequest(activeRequest.id, {
        approved,
        resolutionType: approved ? form.resolutionType : null,
        approvedHouseId: approved ? form.approvedHouseId : null,
        depositHandling: approved ? form.depositHandling : null,
        newRentAmount: approved ? form.newRentAmount : null,
        newDepositAmount: approved ? form.newDepositAmount : null,
        newStartAt: approved ? toIso(form.newStartAt) : null,
        newEndAt: approved ? toIso(form.newEndAt) : null,
        newHandoverDate: approved ? toIso(form.newHandoverDate) : null,
        transferredDepositAmount: approved ? form.transferredDepositAmount : null,
        forfeitAmount: approved ? form.forfeitAmount : null,
        additionalDepositAmount:
          approved && Number(form.additionalDepositAmount ?? 0) > 0
            ? form.additionalDepositAmount
            : null,
        oldRentProratedAmount: approved ? form.oldRentProratedAmount : null,
        oldUtilitiesAmount: approved ? form.oldUtilitiesAmount : null,
        oldDamageAmount: approved ? form.oldDamageAmount : null,
        adminFeeAmount: approved ? form.adminFeeAmount : null,
        settlementAmount: null,
        refundableDepositAmount:
          approved &&
          isActiveLeaseRequest(activeRequest) &&
          Number(form.refundableDepositAmount ?? 0) !== Number(activeRequest.depositAmount ?? 0)
            ? form.refundableDepositAmount
            : null,
        totalAdditionalPaymentAmount:
          approved &&
          isActiveLeaseRequest(activeRequest) &&
          Number(form.totalAdditionalPaymentAmount ?? 0) > 0
            ? form.totalAdditionalPaymentAmount
            : null,
        inspectionNote: approved ? form.inspectionNote || null : null,
        refundAmount: approved ? form.refundAmount : null,
        refundDueAt: approved ? toIso(form.refundDueAt) : null,
        legalBasis: approved ? form.legalBasis || null : null,
        managerNote: form.managerNote || null,
      });
      toast.success(approved ? "Đã duyệt yêu cầu đổi nhà." : "Đã từ chối yêu cầu.");
      closeReview();
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không xử lý được yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  const createReplacement = async (request) => {
    setSubmitting(true);
    try {
      const contract = await createReplacementContract(request.id);
      toast.success("Đã tạo hợp đồng thay thế.");
      await loadData();
      if (contract?.id) navigate(`/contracts/${contract.id}`);
    } catch (error) {
      toast.error(error.message || "Không tạo được hợp đồng thay thế.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (request) => {
    if (
      !window.confirm(
        `Bạn chắc chắn hủy yêu cầu #${shortId(request.id)}? Tenant sẽ không thể tiếp tục.`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await cancelRelocationByManager(request.id);
      toast.success("Đã hủy yêu cầu đổi nhà.");
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không hủy được yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmHandover = async (request) => {
    if (
      !window.confirm(
        `Xác nhận đã bàn giao nhà cũ cho yêu cầu #${shortId(request.id)}? ` +
          "Hợp đồng cũ sẽ kết thúc, hợp đồng mới chính thức có hiệu lực.",
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await confirmRelocationHandover(request.id);
      toast.success("Đã xác nhận bàn giao. Đổi nhà hoàn tất.");
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không xác nhận được bàn giao.");
    } finally {
      setSubmitting(false);
    }
  };

  const isRefundResolution = form.resolutionType === "REFUND_TERMINATE";
  const activeLeaseReview = isActiveLeaseRequest(activeRequest);
  const activeResolutionOptions =
    activeRequest?.faultParty === "LANDLORD"
      ? RESOLUTION_OPTIONS
      : RESOLUTION_OPTIONS.filter((item) => item.value === "REPLACE_HOUSE");
  const activeHandlingOptions = HANDLING_OPTIONS.filter((item) => {
    if (activeLeaseReview) {
      return !["CANCEL_PENDING_DEPOSIT", "REFUND_TO_TENANT"].includes(item.value);
    }
    if (activeRequest?.faultParty === "LANDLORD") {
      return item.value !== "FORFEIT";
    }
    return item.value !== "REFUND_TO_TENANT";
  });
  const reviewCanApprove =
    !activeRequest ||
    isRefundResolution ||
    Boolean(form.approvedHouseId);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Yêu cầu đổi nhà
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Xử lý đổi nhà sau khi khách đã ký hợp đồng.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Báo nhà không ở được
            </button>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Tổng" value={stats.total} />
              <Metric label="Chờ duyệt" value={stats.requested} tone="amber" />
              <Metric label="Chờ khách" value={stats.quoted} tone="indigo" />
              <Metric label="Đã duyệt" value={stats.approved} tone="emerald" />
              <Metric label="Chờ hoàn" value={stats.refundPending} tone="violet" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <div className="relative w-full min-w-[260px] lg:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Tìm theo mã hợp đồng, nhà, khách"
              />
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableHead>Yêu cầu</TableHead>
                <TableHead>Hợp đồng cũ</TableHead>
                <TableHead>Nhà</TableHead>
                <TableHead>Tiền cọc</TableHead>
                <TableHead>Ngày yêu cầu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead align="right">Thao tác</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <Spin />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-sm text-slate-500">
                    Không có yêu cầu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900">#{shortId(request.id)}</div>
                        <FaultBadge fault={request.faultParty} />
                      </div>
                      <div className="mt-1">
                        <KindBadge kind={request.requestKind} />
                      </div>
                      <div className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                        {request.staffReportReason || request.tenantReason || "Không có ghi chú"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => navigate(`/contracts/${request.oldContractId}`)}
                        className="font-medium text-sky-700 hover:text-sky-900"
                      >
                        {displayContractNumber(request)}
                      </button>
                      <div className="mt-1 text-xs text-slate-500">
                        Khách #{shortId(request.tenantId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Home className="h-4 w-4 text-slate-400" />
                        <span>{shortId(request.oldHouseId)}</span>
                        <span className="text-slate-300">→</span>
                        <span className="font-medium text-slate-900">
                          {request.resolutionType === "REFUND_TERMINATE"
                            ? "Hoàn tiền"
                            : shortId(request.approvedHouseId || request.requestedHouseId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(request.depositAmount)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {DEPOSIT_STATUS_META[request.depositStatusSnapshot] ||
                          request.depositStatusSnapshot ||
                          "-"}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        {request.status === "REQUESTED" && (
                          <button
                            type="button"
                            onClick={() => openReview(request)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </button>
                        )}
                        {request.status === "APPROVED" &&
                          request.resolutionType !== "REFUND_TERMINATE" && (
                          <button
                            type="button"
                            onClick={() => createReplacement(request)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <FilePlus2 className="h-4 w-4" />
                            Tạo HĐ
                          </button>
                        )}
                        {request.status === "REFUND_PENDING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
                            <ReceiptText className="h-4 w-4" />
                            Phiếu hoàn
                          </span>
                        )}
                        {request.status === "QUOTED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                            <ReceiptText className="h-4 w-4" />
                            Chờ khách
                          </span>
                        )}
                        {(request.status === "REQUESTED" ||
                          request.status === "QUOTED" ||
                          request.status === "APPROVED") && (
                          <button
                            type="button"
                            onClick={() => cancelRequest(request)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                            Hủy
                          </button>
                        )}
                        {request.status === "CONTRACT_CREATED" &&
                          request.requestKind === "ACTIVE_LEASE_TENANT_UPGRADE" && (
                            <button
                              type="button"
                              onClick={() => confirmHandover(request)}
                              disabled={submitting}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Xác nhận bàn giao
                            </button>
                          )}
                        {request.newContractId && (
                          <button
                            type="button"
                            onClick={() => navigate(`/contracts/${request.newContractId}`)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            HĐ mới
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            <span>Duyệt yêu cầu #{shortId(activeRequest?.id)}</span>
          </div>
        }
        open={Boolean(activeRequest)}
        onCancel={closeReview}
        footer={null}
        width={760}
        destroyOnHidden
      >
        {activeRequest && (
          <div className="space-y-5 pt-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-semibold">
                    {activeLeaseReview
                      ? "Khách đang thuê muốn đổi sang nhà phù hợp hơn"
                      : activeRequest.faultParty === "LANDLORD"
                      ? "Lỗi bên cho thuê: nhà không đủ điều kiện sử dụng"
                      : "Lỗi khách yêu cầu đổi nhà"}
                  </div>
                  <div className="mt-1 text-amber-800">
                    {activeLeaseReview
                      ? "Gửi báo giá/quyết toán cho khách xác nhận trước khi tạo hợp đồng thay thế."
                      : activeRequest.faultParty === "LANDLORD"
                      ? "Khách không mất cọc. Chọn đổi nhà thay thế hoặc hoàn tiền theo điều khoản hợp đồng."
                      : "Tiền cọc được xử lý theo lựa chọn bên dưới và điều khoản đã ký."}
                  </div>
                </div>
              </div>
            </div>

            {activeRequest.staffReportReason && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">Biên bản kỹ thuật</div>
                <p className="mt-1 whitespace-pre-line">{activeRequest.staffReportReason}</p>
                {evidenceItems(activeRequest.staffEvidence).length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bằng chứng đã lưu S3
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {evidenceItems(activeRequest.staffEvidence).map((item) => {
                        const url = evidenceUrl(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => url && setEvidencePreviewUrl(url)}
                            className="group relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                            title={evidenceName(item)}
                          >
                            {url ? (
                              <img src={url} alt={evidenceName(item)} className="h-full w-full object-cover" />
                            ) : (
                              <FileImage className="h-6 w-6 text-sky-600" />
                            )}
                            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-medium text-white">
                              {evidenceName(item)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phương án xử lý">
                <Select
                  value={form.resolutionType}
                  onChange={(value) => {
                    patchForm({
                      resolutionType: value,
                      depositHandling:
                        value === "REFUND_TERMINATE"
                          ? (isPaidDeposit(activeRequest.depositStatusSnapshot)
                              ? "REFUND_TO_TENANT"
                              : "CANCEL_PENDING_DEPOSIT")
                          : (isPaidDeposit(activeRequest.depositStatusSnapshot)
                              ? "TRANSFER_TO_REPLACEMENT"
                              : "CANCEL_PENDING_DEPOSIT"),
                    });
                  }}
                  options={activeResolutionOptions}
                  className="w-full"
                />
              </Field>
              <Field label="Cách xử lý cọc">
                <Select
                  value={form.depositHandling}
                  onChange={(value) => patchForm({ depositHandling: value })}
                  options={activeHandlingOptions}
                  className="w-full"
                />
              </Field>
              {!isRefundResolution && (
                <>
              <Field label="Nhà duyệt chuyển sang">
                <Select
                  value={form.approvedHouseId}
                  onChange={(value) => patchForm({ approvedHouseId: value })}
                  options={houseOptions}
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn nhà"
                  className="w-full"
                />
              </Field>
              <Field label="Giá thuê mới">
                <InputNumber
                  min={0}
                  value={form.newRentAmount}
                  onChange={(value) => patchForm({ newRentAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Cọc hợp đồng mới">
                <InputNumber
                  min={0}
                  value={form.newDepositAmount}
                  onChange={(value) => patchForm({ newDepositAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Cọc chuyển sang HĐ mới">
                <InputNumber
                  min={0}
                  value={form.transferredDepositAmount}
                  onChange={(value) =>
                    patchForm({ transferredDepositAmount: value ?? 0 })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Cọc giữ lại">
                <InputNumber
                  min={0}
                  value={form.forfeitAmount}
                  onChange={(value) => patchForm({ forfeitAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Ngày bắt đầu">
                <DatePicker
                  value={form.newStartAt}
                  onChange={(value) => patchForm({ newStartAt: value })}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Field>
              <Field label="Ngày kết thúc">
                <DatePicker
                  value={form.newEndAt}
                  onChange={(value) => patchForm({ newEndAt: value })}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Field>
              <Field label="Ngày bàn giao">
                <DatePicker
                  value={form.newHandoverDate}
                  onChange={(value) => patchForm({ newHandoverDate: value })}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Field>
              <Field label="Cọc cần thu thêm">
                <InputNumber
                  min={0}
                  value={form.additionalDepositAmount}
                  onChange={(value) =>
                    patchForm({ additionalDepositAmount: value ?? 0 })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              {activeLeaseReview && (
                <>
              <Field label="Tiền thuê còn phải quyết toán">
                <InputNumber
                  min={0}
                  value={form.oldRentProratedAmount}
                  onChange={(value) => patchForm({ oldRentProratedAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Điện nước/dịch vụ chưa thanh toán">
                <InputNumber
                  min={0}
                  value={form.oldUtilitiesAmount}
                  onChange={(value) => patchForm({ oldUtilitiesAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Chi phí hư hỏng do khách">
                <InputNumber
                  min={0}
                  value={form.oldDamageAmount}
                  onChange={(value) => patchForm({ oldDamageAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Phí xử lý/hành chính">
                <InputNumber
                  min={0}
                  value={form.adminFeeAmount}
                  onChange={(value) => patchForm({ adminFeeAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Cọc còn được đối trừ">
                <InputNumber
                  min={0}
                  value={form.refundableDepositAmount}
                  onChange={(value) => patchForm({ refundableDepositAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Tổng khách cần thanh toán thêm">
                <InputNumber
                  min={0}
                  value={form.totalAdditionalPaymentAmount}
                  onChange={(value) =>
                    patchForm({ totalAdditionalPaymentAmount: value ?? 0 })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
                </>
              )}
                </>
              )}
              {isRefundResolution && (
                <>
              <Field label="Số tiền hoàn">
                <InputNumber
                  min={0}
                  value={form.refundAmount}
                  onChange={(value) => patchForm({ refundAmount: value ?? 0 })}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Field>
              <Field label="Hạn hoàn tiền">
                <DatePicker
                  value={form.refundDueAt}
                  onChange={(value) => patchForm({ refundDueAt: value })}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Field>
                </>
              )}
            </div>

            {activeRequest.faultParty === "LANDLORD" && (
              <Field label="Căn cứ pháp lý/điều khoản">
                <Input.TextArea
                  value={form.legalBasis}
                  onChange={(event) => patchForm({ legalBasis: event.target.value })}
                  rows={3}
                  maxLength={1600}
                  showCount
                />
              </Field>
            )}

            {activeLeaseReview && (
              <Field label="Ghi nhận hiện trạng/quyết toán nhà cũ">
                <Input.TextArea
                  value={form.inspectionNote}
                  onChange={(event) => patchForm({ inspectionNote: event.target.value })}
                  rows={3}
                  maxLength={1200}
                  showCount
                  placeholder="Tình trạng nhà cũ, tài sản cần sửa, công nợ dịch vụ và ngày dự kiến bàn giao."
                />
              </Field>
            )}

            <Field label="Ghi chú xử lý">
              <Input.TextArea
                value={form.managerNote}
                onChange={(event) => patchForm({ managerNote: event.target.value })}
                rows={4}
                maxLength={1000}
                showCount
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => submitReview(false)}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
              <button
                type="button"
                onClick={() => submitReview(true)}
                disabled={submitting || !reviewCanApprove}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {activeLeaseReview ? "Gửi báo giá" : "Duyệt yêu cầu"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-sky-600" />
            <span>Biên bản nhà không đủ điều kiện</span>
          </div>
        }
        open={reportOpen}
        onCancel={() => {
          if (!submitting) setReportOpen(false);
        }}
        footer={null}
        width={720}
        destroyOnHidden
      >
        <div className="space-y-5 pt-2">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            Staff/manager ghi nhận nhà không thể bàn giao hoặc không còn phù hợp để ở.
            Hệ thống sẽ tạo yêu cầu lỗi bên cho thuê để manager chọn đổi nhà hoặc hoàn tiền.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Số hợp đồng đã ký">
              <Select
                value={reportForm.contractNumber || undefined}
                onChange={(value) => patchReportForm({ contractNumber: value || "" })}
                onSearch={searchReportContracts}
                options={contractOptions}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  (option?.searchText ?? "").includes(input.toLowerCase())
                }
                notFoundContent={contractSearching ? <Spin size="small" /> : "Không tìm thấy hợp đồng đã ký"}
                placeholder="Nhập số hợp đồng/VNPT để tìm"
                className="w-full"
              />
            </Field>
            <Field label="Nhà thay thế đề xuất">
              <Select
                value={reportForm.recommendedHouseId}
                onChange={(value) => patchReportForm({ recommendedHouseId: value })}
                options={houseOptions}
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder="Bỏ trống nếu chỉ hoàn tiền"
                className="w-full"
              />
            </Field>
          </div>

          <Field label="Nội dung biên bản">
            <Input.TextArea
              value={reportForm.reportReason}
              onChange={(event) => patchReportForm({ reportReason: event.target.value })}
              rows={4}
              maxLength={1000}
              showCount
              placeholder="Ví dụ: nhà bị cháy khu bếp, hệ thống điện không an toàn, chưa thể bàn giao cho khách..."
            />
          </Field>

          <Field label="Bằng chứng ảnh">
            <Upload.Dragger
              multiple
              accept="image/*"
              beforeUpload={() => false}
              fileList={reportForm.evidenceFiles}
              onChange={({ fileList }) =>
                patchReportForm({ evidenceFiles: fileList.slice(0, 5) })
              }
              onRemove={(file) => {
                patchReportForm({
                  evidenceFiles: reportForm.evidenceFiles.filter((item) => item.uid !== file.uid),
                });
              }}
              className="bg-slate-50"
            >
              <div className="flex flex-col items-center gap-2 py-5 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Chọn hoặc kéo thả ảnh biên bản/hiện trạng
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tối đa 5 ảnh, mỗi ảnh không quá 10MB. Hệ thống sẽ upload lên S3 khi tạo biên bản.
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          </Field>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={submitStaffReport}
              disabled={
                submitting ||
                !reportForm.contractNumber.trim() ||
                !reportForm.reportReason.trim() ||
                reportForm.evidenceFiles.length === 0
              }
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              <ClipboardCheck className="h-4 w-4" />
              Tạo biên bản
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(evidencePreviewUrl)}
        onCancel={() => setEvidencePreviewUrl(null)}
        footer={null}
        width={760}
        destroyOnHidden
        title="Bằng chứng"
      >
        {evidencePreviewUrl && (
          <div className="flex flex-col items-center gap-3">
            <img
              src={evidencePreviewUrl}
              alt="Evidence"
              className="max-h-[70vh] max-w-full rounded-lg border border-slate-200"
            />
            <a
              href={evidencePreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              Mở ảnh trong tab mới ↗
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Metric({ label, value, tone = "sky" }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
      : tone === "indigo"
        ? "bg-indigo-50 text-indigo-700"
      : tone === "slate"
        ? "bg-slate-100 text-slate-700"
        : tone === "violet"
          ? "bg-violet-50 text-violet-700"
          : "bg-sky-50 text-sky-700";

  return (
    <div className={`min-w-[118px] rounded-xl px-4 py-3 ${toneClass}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold leading-none">{value}</div>
    </div>
  );
}

function TableHead({ children, align = "left" }) {
  const alignClass = align === "right" ? "text-right" : "text-left";
  return (
    <th
      scope="col"
      className={`px-4 py-3 ${alignClass} text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, align = "left" }) {
  const alignClass = align === "right" ? "text-right" : "text-left";
  return (
    <td className={`whitespace-nowrap px-4 py-4 ${alignClass} text-sm text-slate-700`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status || "-",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

function FaultBadge({ fault }) {
  if (fault === "LANDLORD") {
    return (
      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        Lỗi chủ nhà
      </span>
    );
  }
  if (fault === "TENANT") {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        Lỗi khách
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
      {fault || "Chưa rõ lỗi"}
    </span>
  );
}

function KindBadge({ kind }) {
  const meta = KIND_META[kind] || {
    label: kind || "Chưa phân loại",
    tone: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
