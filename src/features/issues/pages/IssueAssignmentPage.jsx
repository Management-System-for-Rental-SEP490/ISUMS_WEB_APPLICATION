import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  UserCheck,
  RefreshCw,
  Wrench,
  Phone,
  Check,
  Hash,
  Tag,
  CalendarDays,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { getAllIssues, getIssueById } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { confirmManagerWorkSlot } from "../../maintenance/api/maintenance.api";
import { toast } from "react-toastify";
import { ISSUE_STATUS_CONFIG } from "../constants/issue.constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

function Avatar({ name, size = "md" }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const cls = size === "lg" ? "w-12 h-12 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${cls} rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="flex items-center gap-2 text-xs text-gray-400">
        <Icon className="w-3.5 h-3.5 text-gray-300" />
        {label}
      </span>
      <span className={`text-xs font-semibold text-gray-700 ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

export default function IssueAssignmentPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [houseNames, setHouseNames] = useState({});

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({
        type: "REPAIR",
        status: "WAITING_MANAGER_CONFIRM",
      });
      const list = Array.isArray(data) ? data : [];
      setIssues(list);
      if (list.length > 0) setSelected(list[0]);

      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) =>
          getHouseById(id)
            .then((h) => [id, h?.name ?? h?.houseName ?? "—"])
            .catch(() => [id, "—"]),
        ),
      );
      setHouseNames(Object.fromEntries(entries));
    } catch (err) {
      setError(err?.message ?? "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleSelectIssue = async (issue) => {
    setSelected(issue);
    setSelectedDetail(null);
    setDetailLoading(true);
    try {
      const detail = await getIssueById(issue.id);
      setSelectedDetail(detail);
      if (detail?.houseId && !houseNames[detail.houseId]) {
        getHouseById(detail.houseId)
          .then((h) =>
            setHouseNames((prev) => ({
              ...prev,
              [detail.houseId]: h?.name ?? h?.houseName ?? "—",
            })),
          )
          .catch(() => {});
      }
    } catch {
      // fallback to list data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      await confirmManagerWorkSlot(selected.id);
      toast.success(`Đã xác nhận ca làm việc: ${selected.title}`);
      fetchIssues();
    } catch (e) {
      toast.error(e.message ?? "Xác nhận thất bại, vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  const detail = selectedDetail ?? selected;
  const status = detail
    ? (ISSUE_STATUS_CONFIG[detail.status] ?? ISSUE_STATUS_CONFIG.CREATED)
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phân công xử lý</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Đang tải..."
              : `${issues.length} yêu cầu sửa chữa chờ xử lý`}
          </p>
        </div>
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchIssues}
            className="text-xs text-red-600 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-5 items-start">
        {/* LEFT — issue list */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Yêu cầu sửa chữa</p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
              {issues.length}
            </span>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
            {loading &&
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="px-4 py-3 border-b border-gray-50 animate-pulse space-y-2"
                >
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}

            {!loading && issues.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                Không có yêu cầu nào
              </div>
            )}

            {!loading &&
              issues.map((issue) => {
                const isActive = selected?.id === issue.id;
                return (
                  <button
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition hover:bg-gray-50 ${
                      isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                        #{String(issue.id).slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {dayjs(issue.createdAt).fromNow()}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold leading-snug truncate ${isActive ? "text-teal-700" : "text-gray-800"}`}
                    >
                      {issue.title}
                    </p>
                    <p className="text-[11px] mt-1 flex items-center gap-1">
                      {issue.assignedStaffId ? (
                        <span className="text-blue-500 font-medium flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />{" "}
                          {issue.staffName ?? "Đã phân công"}
                        </span>
                      ) : (
                        <span className="text-orange-400 font-medium">
                          ● Chưa phân công
                        </span>
                      )}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* RIGHT — detail panel */}
        {!loading && selected ? (
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Detail header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg">
                    Issue #{String(detail.id).slice(0, 8).toUpperCase()}
                  </span>
                  {status && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${status.pill}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {detail.title}
                </h3>
                {detail.houseId && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {houseNames[detail.houseId] ?? "Đang tải..."}
                  </p>
                )}
              </div>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {confirming ? "Đang xác nhận..." : "Xác nhận ca làm việc"}
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-2 gap-5">
              {/* LEFT column: mô tả + ca làm việc */}
              <div className="space-y-4">
                {/* Mô tả */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Mô tả
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detail.description ?? "Không có mô tả."}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200 text-[11px] text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {dayjs(detail.createdAt).format("DD/MM/YYYY · HH:mm")}
                    </div>
                  </div>
                </div>

                {/* Ca làm việc */}
                {detail.startTime && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Ca làm việc
                    </p>
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                            <CalendarClock className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="w-px flex-1 bg-teal-200 min-h-[24px]" />
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-[10px] text-teal-500 font-semibold uppercase tracking-wide">
                              Bắt đầu
                            </p>
                            <p className="text-sm font-bold text-teal-800">
                              {dayjs(detail.startTime).format("HH:mm")}
                              <span className="font-normal text-teal-600 ml-1.5 text-xs">
                                {dayjs(detail.startTime).format("DD/MM/YYYY")}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-teal-300">
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span className="text-[11px] text-teal-400">
                              {detail.endTime
                                ? `${dayjs(detail.endTime).diff(dayjs(detail.startTime), "minute")} phút`
                                : ""}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] text-teal-500 font-semibold uppercase tracking-wide">
                              Kết thúc
                            </p>
                            <p className="text-sm font-bold text-teal-800">
                              {detail.endTime
                                ? dayjs(detail.endTime).format("HH:mm")
                                : "—"}
                              {detail.endTime && (
                                <span className="font-normal text-teal-600 ml-1.5 text-xs">
                                  {dayjs(detail.endTime).format("DD/MM/YYYY")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT column: nhân viên + thông tin */}
              <div className="space-y-4">
                {/* Nhân viên xử lý */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Nhân viên xử lý
                  </p>
                  {detail.assignedStaffId ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                      <Avatar name={detail.staffName} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">
                          {detail.staffName ?? "Nhân viên"}
                        </p>
                        {detail.staffPhone && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {detail.staffPhone}
                          </p>
                        )}
                      </div>
                      {detail.staffPhone && (
                        <a
                          href={`tel:${detail.staffPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Gọi
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700">
                          Chưa phân công
                        </p>
                        <p className="text-xs text-orange-400 mt-0.5">
                          Nhấn "Gán nhân viên" để phân công
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Thông tin
                  </p>
                  <div className="bg-gray-50 rounded-xl px-4 py-1 border border-gray-100">
                    <InfoRow
                      icon={Hash}
                      label="Mã yêu cầu"
                      value={String(detail.id).slice(0, 8).toUpperCase()}
                      valueClass="font-mono"
                    />
                    <InfoRow icon={Tag} label="Loại" value="Sửa chữa" />
                    <InfoRow
                      icon={CalendarDays}
                      label="Ngày tạo"
                      value={dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm")}
                    />
                    <InfoRow
                      icon={Phone}
                      label="SĐT khách"
                      value={detail.tenantPhone ?? "—"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center py-24">
              <div className="text-center text-gray-400">
                <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Chọn một yêu cầu để xem chi tiết</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
