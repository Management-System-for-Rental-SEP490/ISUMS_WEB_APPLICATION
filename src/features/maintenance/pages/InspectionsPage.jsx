import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  House,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { getContractById } from "../../contracts/api/contracts.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getWorkSlotById } from "../../schedule/api/schedule.api";
import { getUserById } from "../../tenants/api/users.api";
import CreateInspectionModal from "../components/CreateInspectionModal";
import { getInspections } from "../api/maintenance.api";

const STATUS_CONFIG = {
  CREATED: { bg: "#F3F4F6", color: "#4B5563", dot: "#6B7280" },
  SCHEDULED: { bg: "#EAF4FF", color: "#1769AA", dot: "#2096D8" },
  IN_PROGRESS: { bg: "#E8F8F1", color: "#187A56", dot: "#3BB582" },
  PENDING_MANAGER_REVIEW: { bg: "#FFF7E6", color: "#9A6200", dot: "#E6A31A" },
  DONE: { bg: "#EEF2FF", color: "#4F46A5", dot: "#6366F1" },
  APPROVED: { bg: "#E8F8F1", color: "#187A56", dot: "#3BB582" },
  CANCELLED: { bg: "#FFF0ED", color: "#B8402F", dot: "#D95F4B" },
};

const STATUS_FILTER_VALUES = [
  "",
  "CREATED",
  "SCHEDULED",
  "IN_PROGRESS",
  "DONE",
  "PENDING_MANAGER_REVIEW",
  "APPROVED",
  "CANCELLED",
];

const TYPE_CONFIG = {
  CHECK_IN: { bg: "#E8F8F1", color: "#187A56" },
  CHECK_OUT: { bg: "#FFF0ED", color: "#B8402F" },
};

const TABS = [
  { key: "CHECK_IN", labelKey: "inspection.type.CHECK_IN", color: "#2D9D72" },
  { key: "CHECK_OUT", labelKey: "inspection.type.CHECK_OUT", color: "#D95F4B" },
];

const GENERIC_NOTES = [
  "kiểm tra bàn giao nhà trước khi khách vào ở",
  "kiem tra ban giao nha truoc khi khach vao o",
  "kiểm tra bàn giao nhà khi khách trả nhà",
  "kiem tra ban giao nha khi khach tra nha",
  "kiểm tra nhà trước khi bàn giao",
  "kiem tra nha truoc khi ban giao",
];

function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function shortId(value) {
  return value ? String(value).slice(0, 8).toUpperCase() : "--------";
}

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

function formatVietnamInstant(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: VIETNAM_TIME_ZONE,
    }).format(date),
    time: new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: VIETNAM_TIME_ZONE,
    }).format(date),
  };
}

function formatVietnamLocalSlot(startTime, endTime) {
  if (!startTime) return null;
  const [datePart, startPart = ""] = String(startTime).split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return null;

  const endPart = String(endTime ?? "").split("T")[1] ?? "";
  const start = startPart.slice(0, 5);
  const end = endPart.slice(0, 5);
  return {
    date: `${day}/${month}/${year}`,
    time: end ? `${start} - ${end}` : start || null,
  };
}

function meaningfulNote(note) {
  const normalized = note?.trim().toLocaleLowerCase("vi-VN");
  if (!normalized || GENERIC_NOTES.some((value) => normalized.includes(value))) {
    return null;
  }
  return note.trim();
}

function resolveHouse(house, houseId) {
  const name =
    house?.name ??
    house?.houseName ??
    house?.code ??
    `Nhà #${shortId(houseId)}`;
  const address = [
    house?.address,
    house?.ward,
    house?.district,
    house?.city,
  ]
    .filter(Boolean)
    .join(", ");
  return { name, address };
}

function resolveContract(contract, contractId) {
  const rawNumber =
    contract?.contractNumber ??
    contract?.code ??
    contract?.name ??
    null;
  return {
    number:
      rawNumber && !/^econtract_/i.test(rawNumber)
        ? rawNumber
        : shortId(contractId),
    tenantName:
      contract?.tenantName ??
      contract?.tenant?.name ??
      contract?.tenant?.fullName ??
      contract?.nameOfTenant ??
      contract?.name ??
      null,
    tenantContact:
      contract?.tenantEmail ??
      contract?.tenant?.email ??
      contract?.email ??
      contract?.tenantPhone ??
      contract?.tenant?.phoneNumber ??
      contract?.phoneNumber ??
      null,
  };
}

function resolveStaff(item, staff) {
  return {
    name:
      item?.staffName ??
      staff?.fullName ??
      staff?.name ??
      staff?.username ??
      null,
    contact:
      item?.staffPhone ??
      staff?.phoneNumber ??
      staff?.phone ??
      staff?.email ??
      null,
  };
}

function resolveSlot(slot) {
  return {
    startTime: slot?.startTime ?? null,
    endTime: slot?.endTime ?? null,
  };
}

function getTimeMeta(item, t) {
  if (item.status === "CREATED") {
    return {
      label: t("inspection.createdAt"),
      ...(formatVietnamInstant(item.createdAt) ?? {}),
    };
  }

  if (["SCHEDULED", "IN_PROGRESS"].includes(item.status)) {
    return {
      label: t("inspection.scheduledAt"),
      ...(formatVietnamLocalSlot(
        item.slotInfo?.startTime,
        item.slotInfo?.endTime,
      ) ?? { date: t("inspection.scheduleUnavailable") }),
    };
  }

  const labelKeys = {
    DONE: "completedLabel",
    PENDING_MANAGER_REVIEW: "submittedAt",
    APPROVED: "approvedAt",
    CANCELLED: "cancelledAt",
  };
  return {
    label: t(`inspection.${labelKeys[item.status] ?? "updatedAt"}`),
    ...(formatVietnamInstant(item.updatedAt ?? item.createdAt) ?? {}),
  };
}

function getActionLabel(status, t) {
  const keyByStatus = {
    CREATED: "actionViewRequest",
    SCHEDULED: "actionViewSchedule",
    IN_PROGRESS: "actionTrack",
    DONE: "actionReview",
    PENDING_MANAGER_REVIEW: "actionReview",
    APPROVED: "actionViewReport",
    CANCELLED: "actionViewDetail",
  };
  return t(`inspection.${keyByStatus[status] ?? "actionViewDetail"}`);
}

function StatusBadge({ status, t }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: config.dot }}
      />
      {t(`inspection.status.${status}`, { defaultValue: status })}
    </span>
  );
}

function RecordAction({ item, onClick, t }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
    >
      {getActionLabel(item.status, t)}
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
  );
}

export default function InspectionsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("CHECK_IN");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInspections({
        page: 1,
        size: 50,
        sortBy: "createdAt",
        sortDir: "DESC",
      });
      const items = extractItems(response);
      setInspections(
        items.map((item) => ({
          ...item,
          houseInfo: resolveHouse(null, item.houseId),
          contractInfo: resolveContract(null, item.contractId),
          staffInfo: resolveStaff(item, null),
          slotInfo: resolveSlot(null),
        })),
      );
      setLoading(false);

      const houseIds = [...new Set(items.map((item) => item.houseId).filter(Boolean))];
      const contractIds = [
        ...new Set(items.map((item) => item.contractId).filter(Boolean)),
      ];
      const staffIds = [
        ...new Set(items.map((item) => item.assignedStaffId).filter(Boolean)),
      ];
      const slotIds = [
        ...new Set(items.map((item) => item.slotId).filter(Boolean)),
      ];

      const [houses, contracts, staffs, slots] = await Promise.all([
        Promise.all(
          houseIds.map(async (id) => [
            id,
            await getHouseById(id).catch(() => null),
          ]),
        ),
        Promise.all(
          contractIds.map(async (id) => [
            id,
            await getContractById(id).catch(() => null),
          ]),
        ),
        Promise.all(
          staffIds.map(async (id) => [
            id,
            await getUserById(id).catch(() => null),
          ]),
        ),
        Promise.all(
          slotIds.map(async (id) => [
            id,
            await getWorkSlotById(id).catch(() => null),
          ]),
        ),
      ]);

      const houseMap = new Map(houses);
      const contractMap = new Map(contracts);
      const staffMap = new Map(staffs);
      const slotMap = new Map(slots);

      setInspections(
        items.map((item) => ({
          ...item,
          houseInfo: resolveHouse(houseMap.get(item.houseId), item.houseId),
          contractInfo: resolveContract(
            contractMap.get(item.contractId),
            item.contractId,
          ),
          staffInfo: resolveStaff(item, staffMap.get(item.assignedStaffId)),
          slotInfo: resolveSlot(slotMap.get(item.slotId)),
        })),
      );
    } catch (fetchError) {
      setError(fetchError.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchInspections();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchInspections]);

  const countsByType = useMemo(
    () =>
      inspections.reduce(
        (counts, item) => {
          if (counts[item.type] !== undefined) counts[item.type] += 1;
          return counts;
        },
        { CHECK_IN: 0, CHECK_OUT: 0 },
      ),
    [inspections],
  );

  const tabInspections = useMemo(
    () => inspections.filter((item) => item.type === activeTab),
    [activeTab, inspections],
  );

  const summary = useMemo(
    () => ({
      total: tabInspections.length,
      waiting: tabInspections.filter((item) => item.status === "CREATED").length,
      active: tabInspections.filter((item) =>
        ["SCHEDULED", "IN_PROGRESS"].includes(item.status),
      ).length,
      review: tabInspections.filter((item) =>
        ["DONE", "PENDING_MANAGER_REVIEW"].includes(item.status),
      ).length,
      approved: tabInspections.filter((item) => item.status === "APPROVED").length,
    }),
    [tabInspections],
  );

  const visibleInspections = useMemo(() => {
    const keyword = searchTerm.trim().toLocaleLowerCase("vi-VN");
    return tabInspections.filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;
      if (!keyword) return true;
      const searchable = [
        item.houseInfo?.name,
        item.houseInfo?.address,
        item.contractInfo?.number,
        item.contractInfo?.tenantName,
        item.contractInfo?.tenantContact,
        item.staffInfo?.name,
        item.staffInfo?.contact,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi-VN");
      return searchable.includes(keyword);
    });
  }, [filterStatus, searchTerm, tabInspections]);

  const summaryItems = [
    ["total", t("inspection.summaryTotal")],
    ["waiting", t("inspection.summaryWaiting")],
    ["active", t("inspection.summaryActive")],
    ["review", t("inspection.summaryReview")],
    ["approved", t("inspection.summaryApproved")],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-slate-900">
            {t("inspection.pageTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {t("inspection.pageSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchInspections}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 text-emerald-600 ${loading ? "animate-spin" : ""}`}
            />
            {t("actions.refresh")}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            {t("inspection.createBtn")}
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200 px-4 pt-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setFilterStatus("");
                }}
                className="flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition"
                style={{
                  borderBottomColor: active ? tab.color : "transparent",
                  color: active ? tab.color : "#64748B",
                }}
              >
                {t(tab.labelKey)}
                <span
                  className="min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px]"
                  style={{
                    background: active ? `${tab.color}16` : "#F1F5F9",
                    color: active ? tab.color : "#64748B",
                  }}
                >
                  {countsByType[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 sm:grid-cols-5">
          {summaryItems.map(([key, label], index) => (
            <div
              key={key}
              className={`px-4 py-3 ${
                index < summaryItems.length - 1 ? "sm:border-r sm:border-slate-200" : ""
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">
                {summary[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-b border-slate-200 px-4 py-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("inspection.searchPlaceholder")}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {STATUS_FILTER_VALUES.map((value) => {
              const active = filterStatus === value;
              const config = value ? STATUS_CONFIG[value] : null;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilterStatus(value)}
                  className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition"
                  style={
                    active
                      ? {
                          background: config?.bg ?? "#E8F8F1",
                          color: config?.color ?? "#187A56",
                          borderColor: config?.dot ?? "#3BB582",
                        }
                      : {
                          background: "#FFFFFF",
                          color: "#64748B",
                          borderColor: "#E2E8F0",
                        }
                  }
                >
                  {config && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: config.dot }}
                    />
                  )}
                  {value
                    ? t(`inspection.status.${value}`, { defaultValue: value })
                    : t("inspection.filterAll")}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="space-y-0">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex gap-5 border-b border-slate-100 px-5 py-5"
              >
                <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-72 max-w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchInspections}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
            >
              {t("actions.retry")}
            </button>
          </div>
        )}

        {!loading && !error && visibleInspections.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {t("inspection.emptyTitle")}
            </p>
            <p className="text-xs text-slate-500">
              {searchTerm || filterStatus
                ? t("inspection.emptyFiltered")
                : activeTab === "CHECK_IN"
                  ? t("inspection.emptyCheckin")
                  : t("inspection.emptyCheckout")}
            </p>
          </div>
        )}

        {!loading && !error && visibleInspections.length > 0 && (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <div className="min-w-[1180px]">
                <div className="grid grid-cols-[minmax(250px,1.5fr)_minmax(170px,1fr)_100px_minmax(160px,.9fr)_minmax(160px,.9fr)_170px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  {[
                    t("inspection.colHouse"),
                    t("inspection.colTenant"),
                    t("inspection.colType"),
                    t("inspection.colSchedule"),
                    t("inspection.colStaff"),
                    t("inspection.colStatus"),
                    t("inspection.colAction"),
                  ].map((label) => (
                    <p
                      key={label}
                      className="text-[11px] font-bold uppercase text-slate-500"
                    >
                      {label}
                    </p>
                  ))}
                </div>

                {visibleInspections.map((item) => {
                  const type = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.CHECK_IN;
                  const time = getTimeMeta(item, t);
                  const note = meaningfulNote(item.note);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(250px,1.5fr)_minmax(170px,1fr)_100px_minmax(160px,.9fr)_minmax(160px,.9fr)_170px_150px] items-center gap-4 border-b border-slate-100 px-5 py-4 transition last:border-b-0 hover:bg-emerald-50/40"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <House className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.houseInfo.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.houseInfo.address ||
                              t("inspection.addressUnavailable")}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-emerald-700">
                            {t("inspection.contractLabel")} #
                            {item.contractInfo.number}
                          </p>
                          {note && (
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.contractInfo.tenantName ??
                            t("inspection.tenantUnknown")}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.contractInfo.tenantContact ?? "—"}
                        </p>
                      </div>

                      <span
                        className="w-fit rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: type.bg, color: type.color }}
                      >
                        {t(`inspection.type.${item.type}`, {
                          defaultValue: item.type,
                        })}
                      </span>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {time.label}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-sm font-medium text-slate-800">
                          {time.date ?? "—"}
                        </p>
                        {time.time && (
                          <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                            {time.time}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.staffInfo.name ?? t("inspection.staffNone")}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.staffInfo.contact ?? "—"}
                        </p>
                      </div>

                      <StatusBadge status={item.status} t={t} />

                      <RecordAction
                        item={item}
                        t={t}
                        onClick={() =>
                          navigate(`/maintenance/inspections/${item.id}`)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {visibleInspections.map((item) => {
                const type = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.CHECK_IN;
                const time = getTimeMeta(item, t);
                return (
                  <article key={item.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <House className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {item.houseInfo.name}
                          </h3>
                          <p className="truncate text-xs text-slate-500">
                            {item.houseInfo.address ||
                              t("inspection.addressUnavailable")}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-emerald-700">
                            {t("inspection.contractLabel")} #
                            {item.contractInfo.number}
                          </p>
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
                        style={{ background: type.bg, color: type.color }}
                      >
                        {t(`inspection.type.${item.type}`, {
                          defaultValue: item.type,
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <UserRound className="h-3 w-3" />
                          {t("inspection.colTenant")}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                          {item.contractInfo.tenantName ??
                            t("inspection.tenantUnknown")}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <CalendarClock className="h-3 w-3" />
                          {time.label}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {time.date ?? "—"}
                        </p>
                        {time.time && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {time.time}
                          </p>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <FileCheck2 className="h-3 w-3" />
                          {t("inspection.colStaff")}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                          {item.staffInfo.name ?? t("inspection.staffNone")}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-slate-500">
                          {t("inspection.colStatus")}
                        </p>
                        <StatusBadge status={item.status} t={t} />
                      </div>
                    </div>

                    <RecordAction
                      item={item}
                      t={t}
                      onClick={() =>
                        navigate(`/maintenance/inspections/${item.id}`)
                      }
                    />
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <CreateInspectionModal
        open={showCreate}
        type={activeTab}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          fetchInspections();
        }}
      />
    </div>
  );
}
