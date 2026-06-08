import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Circle,
  Clock3,
  LoaderCircle,
  Play,
  RefreshCw,
  SquareStop,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  cancelContractDemo,
  getAllContracts,
  previewContractDemo,
  runContractDemo,
} from "../../contracts/api/contracts.api";
import { getErrorMessage } from "../../../lib/api-helpers";

const SCENARIOS = [
  { value: "D60", label: "D-60", hint: "Nhắc ưu tiên khách cũ" },
  { value: "D30", label: "D-30", hint: "Mở cửa sổ đặt cọc" },
  { value: "D14", label: "D-14", hint: "Nhắc gia hạn" },
  { value: "D7", label: "D-7", hint: "Nhắc gia hạn" },
  { value: "D3", label: "D-3", hint: "Nhắc gia hạn" },
  { value: "D1", label: "D-1", hint: "Nhắc trước ngày hết hạn" },
  { value: "D0", label: "D-0", hint: "Mở cọc + nhắc cuối" },
  { value: "EXPIRED", label: "Đã hết hạn", hint: "Chấm dứt HĐ + check-out (phá huỷ)", danger: true },
  { value: "CUSTOM", label: "Tùy chọn", hint: "Mốc nghiệp vụ hợp lệ" },
];

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "short",
  timeStyle: "medium",
});

function pageItems(raw) {
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.data ?? raw?.content ?? [];
}

function formatDateTime(value) {
  if (!value) return "—";
  return DATE_TIME_FORMAT.format(new Date(value));
}

function statusLabel(value) {
  const labels = {
    COMPLETED: "Đã ký",
    IN_PROGRESS: "Đang ký",
    PENDING_TERMINATION: "Chờ trả nhà",
    INSPECTION_DONE: "Đã duyệt bàn giao",
    ACTIVE: "Đang chạy",
  };
  return labels[value] ?? value ?? "—";
}

function ReadinessRow({ ready, children }) {
  const Icon = ready ? Check : Circle;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: ready ? "#17835b" : "#94a3b8" }}
      />
      <span style={{ color: ready ? "#1E2D28" : "#64748b" }}>{children}</span>
    </div>
  );
}

export default function ContractDemoEnvironment() {
  const [contracts, setContracts] = useState([]);
  const [contractId, setContractId] = useState("");
  const [scenario, setScenario] = useState("D30");
  const [customTime, setCustomTime] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [running, setRunning] = useState(false);

  const selected = useMemo(
    () => contracts.find((item) => item.id === contractId) ?? null,
    [contracts, contractId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContracts(true);
      try {
        const raw = await getAllContracts({
          status: "COMPLETED",
          size: 100,
          sorts: "createdAt:DESC",
        });
        if (!cancelled) setContracts(pageItems(raw));
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoadingContracts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPreview(null);
    setConfirmation("");
  }, [contractId, scenario, customTime]);

  const requestParams = () => ({
    contractId,
    scenario,
    ...(scenario === "CUSTOM" && customTime
      ? { customEffectiveAt: new Date(customTime).toISOString() }
      : {}),
  });

  const handlePreview = async () => {
    if (!contractId) {
      toast.error("Chọn một hợp đồng demo.");
      return;
    }
    if (scenario === "CUSTOM" && !customTime) {
      toast.error("Chọn thời gian mô phỏng.");
      return;
    }
    setLoadingPreview(true);
    try {
      setPreview(await previewContractDemo(requestParams()));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRun = async () => {
    if (!preview) {
      toast.error("Xem trước tác động trước khi chạy.");
      return;
    }
    setRunning(true);
    try {
      const result = await runContractDemo({
        ...requestParams(),
        confirmation: confirmation.trim(),
      });
      setPreview(result);
      toast.success(
        result?.sessionStatus === "ACTIVE"
          ? "Đã bắt đầu luồng hết hạn và tạo kiểm tra check-out."
          : "Đã chạy mốc thông báo hợp đồng.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRunning(false);
    }
  };

  const handleCancel = async () => {
    setRunning(true);
    try {
      await cancelContractDemo(contractId);
      setPreview((current) => current
        ? { ...current, sessionStatus: "CANCELLED" }
        : current);
      toast.info("Đã dừng đồng hồ demo. Nghiệp vụ đã phát sinh không được hoàn tác.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRunning(false);
    }
  };

  const confirmationCode =
    selected?.documentNo || selected?.id?.slice(0, 8) || "";
  const canRun =
    preview &&
    confirmation.trim().toLowerCase() === confirmationCode.toLowerCase() &&
    !running;

  return (
    <div className="space-y-5">
      <div
        className="rounded-lg border bg-white p-5"
        style={{ borderColor: "#C4DED5" }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" style={{ color: "#17835b" }} />
              <h3 className="text-lg font-semibold" style={{ color: "#1E2D28" }}>
                Môi trường demo hợp đồng
              </h3>
            </div>
            <p className="mt-1 max-w-3xl text-sm" style={{ color: "#5A7A6E" }}>
              Mô phỏng thời gian cho một hợp đồng nhưng vẫn chạy database, Kafka,
              kiểm tra bàn giao, thanh toán và quyền vào nhà thật.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#5A7A6E" }}>
            <Clock3 className="h-4 w-4" />
            Giờ thật VN: {formatDateTime(new Date())}
          </div>
        </div>

        <div
          className="mt-4 flex gap-3 rounded-lg border p-3 text-sm"
          style={{ borderColor: "#F2C078", background: "#FFF9ED", color: "#76520f" }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Dùng hợp đồng test. Dừng phiên demo không rollback email, Kafka,
            inspection, trạng thái hợp đồng hoặc quyền vào nhà đã thay đổi.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <section
          className="rounded-lg border bg-white p-5"
          style={{ borderColor: "#C4DED5" }}
        >
          <h4 className="font-semibold" style={{ color: "#1E2D28" }}>
            1. Chọn kịch bản
          </h4>

          <label className="mt-4 block text-sm font-medium" style={{ color: "#1E2D28" }}>
            Hợp đồng test
          </label>
          <select
            value={contractId}
            onChange={(event) => setContractId(event.target.value)}
            disabled={loadingContracts}
            className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "#C4DED5" }}
          >
            <option value="">
              {loadingContracts ? "Đang tải hợp đồng..." : "Chọn hợp đồng đã ký"}
            </option>
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.documentNo || contract.id.slice(0, 8)} ·{" "}
                {contract.tenantName || "Chưa có tên"} · hết hạn{" "}
                {formatDateTime(contract.endAt)}
              </option>
            ))}
          </select>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {SCENARIOS.map((item) => {
              const active = scenario === item.value;
              const danger = item.danger;
              return (
                <button
                  key={item.value}
                  type="button"
                  title={item.hint}
                  onClick={() => setScenario(item.value)}
                  className="min-h-16 rounded-lg border px-2 py-2 text-sm transition"
                  style={active
                    ? (danger
                        ? { borderColor: "#dc2626", background: "#fef2f2", color: "#b91c1c", fontWeight: 600 }
                        : { borderColor: "#17835b", background: "#EAF7F1", color: "#126747", fontWeight: 600 })
                    : (danger
                        ? { borderColor: "#fecaca", color: "#dc2626" }
                        : { borderColor: "#D8E7E1", color: "#5A7A6E" })}
                >
                  {item.label}
                  <span className="mt-1 block text-[11px] font-normal leading-4">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {scenario === "CUSTOM" && (
            <div className="mt-4">
              <label className="block text-sm font-medium" style={{ color: "#1E2D28" }}>
                Thời gian mô phỏng (Asia/Ho_Chi_Minh)
              </label>
              <input
                type="datetime-local"
                value={customTime}
                onChange={(event) => setCustomTime(event.target.value)}
                className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "#C4DED5" }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handlePreview}
            disabled={loadingPreview}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            style={{ borderColor: "#17835b", color: "#126747" }}
          >
            {loadingPreview
              ? <LoaderCircle className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />}
            Xem trước tác động
          </button>

          {preview && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: "#E4EEE9" }}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs" style={{ color: "#64748b" }}>Thời gian mô phỏng</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "#1E2D28" }}>
                    {formatDateTime(preview.effectiveAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#64748b" }}>Khoảng cách đến hết hạn</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "#1E2D28" }}>
                    {preview.daysRemaining < 0
                      ? `Đã quá hạn ${Math.abs(preview.daysRemaining)} ngày`
                      : `Còn ${preview.daysRemaining} ngày`}
                  </p>
                </div>
              </div>

              <h5 className="mt-5 text-sm font-semibold" style={{ color: "#1E2D28" }}>
                Nghiệp vụ sẽ chạy
              </h5>
              <ol className="mt-2 space-y-2">
                {preview.actions?.map((action, index) => (
                  <li key={action} className="flex gap-2 text-sm" style={{ color: "#425B52" }}>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ background: "#EAF7F1", color: "#126747" }}
                    >
                      {index + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <section
          className="rounded-lg border bg-white p-5"
          style={{ borderColor: "#C4DED5" }}
        >
          <h4 className="font-semibold" style={{ color: "#1E2D28" }}>
            2. Kiểm tra và thực thi
          </h4>

          {!preview ? (
            <div className="mt-8 text-center text-sm" style={{ color: "#64748b" }}>
              Xem trước kịch bản để kiểm tra người thuê cũ, người thuê kế tiếp và
              điều kiện bàn giao.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3" style={{ borderColor: "#D8E7E1" }}>
                  <p className="text-xs font-medium" style={{ color: "#64748b" }}>Khách hiện tại</p>
                  <p className="mt-1 font-semibold" style={{ color: "#1E2D28" }}>
                    {preview.currentContract?.tenantName || "—"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                    {statusLabel(preview.currentContract?.status)}
                  </p>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: "#D8E7E1" }}>
                  <p className="text-xs font-medium" style={{ color: "#64748b" }}>Khách kế tiếp</p>
                  <p className="mt-1 font-semibold" style={{ color: "#1E2D28" }}>
                    {preview.nextContract?.tenantName || "Chưa có"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                    {preview.nextContract
                      ? `Bắt đầu ${formatDateTime(preview.nextContract.startAt)}`
                      : "Nhà sẽ chuyển AVAILABLE sau check-out"}
                  </p>
                </div>
              </div>

              {preview.nextTenantReadiness && (
                <div className="mt-4 space-y-2 rounded-lg border p-3" style={{ borderColor: "#D8E7E1" }}>
                  <ReadinessRow ready={preview.nextTenantReadiness.contractSigned}>
                    Hợp đồng mới đã ký đủ hai bên
                  </ReadinessRow>
                  <ReadinessRow ready={preview.nextTenantReadiness.depositPaid}>
                    Đã thanh toán tiền cọc
                  </ReadinessRow>
                  <ReadinessRow ready={preview.nextTenantReadiness.firstRentPaid}>
                    Đã thanh toán tiền thuê đầu
                  </ReadinessRow>
                  <ReadinessRow ready={preview.nextTenantReadiness.startDateReached}>
                    Đã tới ngày bắt đầu hợp đồng
                  </ReadinessRow>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium" style={{ color: "#1E2D28" }}>
                  Nhập mã xác nhận
                </label>
                <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                  Nhập <strong>{confirmationCode}</strong> để xác nhận đúng hợp đồng.
                </p>
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: "#C4DED5" }}
                  placeholder={confirmationCode}
                  autoComplete="off"
                />
              </div>

              <button
                type="button"
                onClick={handleRun}
                disabled={!canRun}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                style={{ background: "#167554" }}
              >
                {running
                  ? <LoaderCircle className="h-4 w-4 animate-spin" />
                  : <Play className="h-4 w-4" />}
                Chạy kịch bản thật
              </button>

              {preview.sessionStatus === "ACTIVE" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={running}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
                  style={{ borderColor: "#D8A1A1", color: "#9f2d2d" }}
                >
                  <SquareStop className="h-4 w-4" />
                  Dừng đồng hồ demo
                </button>
              )}

              {preview.sessionStatus && (
                <p className="mt-3 text-center text-xs" style={{ color: "#64748b" }}>
                  Phiên: {preview.sessionId?.slice(0, 8)} ·{" "}
                  {statusLabel(preview.sessionStatus)}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
