import { Steps } from "antd";
import { X } from "lucide-react";

const B = {
  green:   "#3bb582",
  fg:      "#1E2D28",
  mutedFg: "#5A7A6E",
  border:  "#C4DED5",
  muted:   "#EAF4F0",
};

const STATUS_FLOW = [
  { key: "CREATED",                        label: "Tiếp nhận yêu cầu",            desc: "Yêu cầu mới được tạo trong hệ thống" },
  { key: "SCHEDULED",                      label: "Đã lên lịch",                  desc: "Kỹ thuật viên được phân công, lịch làm việc xác nhận" },
  { key: "IN_PROGRESS",                    label: "Đang xử lý",                   desc: "Kỹ thuật viên đang thực hiện tại hiện trường" },
  { key: "WAITING_MANAGER_CONFIRM",        label: "Chờ quản lý xác nhận",         desc: "Kỹ thuật viên hoàn tất, chờ quản lý xác nhận kết quả" },
  { key: "WAITING_MANAGER_APPROVAL_QUOTE", label: "Chờ quản lý duyệt báo giá",    desc: "Báo giá chi phí phát sinh đang chờ quản lý phê duyệt" },
  { key: "WAITING_TENANT_APPROVAL_QUOTE",  label: "Chờ khách thuê duyệt báo giá", desc: "Báo giá đã được quản lý duyệt, chờ khách thuê xác nhận" },
  { key: "WAITING_PAYMENT",               label: "Chờ thanh toán",               desc: "Khách thuê xác nhận, đang chờ hoàn tất thanh toán" },
  { key: "DONE",                           label: "Hoàn thành",                   desc: "Yêu cầu đã được xử lý và thanh toán xong" },
  { key: "CLOSED",                         label: "Đã đóng",                      desc: "Yêu cầu đã được đóng" },
];

/**
 * @param {{ status: string }} props
 */
export default function IssueTimeline({ status }) {
  if (status === "CANCELLED") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(217,95,75,0.06)", border: "1px solid rgba(217,95,75,0.2)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(217,95,75,0.12)" }}
        >
          <X className="w-4 h-4" style={{ color: "#D95F4B" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>Đã hủy</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(217,95,75,0.7)" }}>
            Yêu cầu này đã bị hủy và không còn được xử lý
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.findIndex((s) => s.key === status);

  const items = STATUS_FLOW.map((s, idx) => {
    let stepStatus;
    if (idx < currentIdx)        stepStatus = "finish";
    else if (idx === currentIdx) stepStatus = "process";
    else                         stepStatus = "wait";

    return {
      status: stepStatus,
      title: (
        <span
          className="text-xs font-semibold"
          style={{ color: idx <= currentIdx ? B.fg : B.mutedFg }}
        >
          {s.label}
        </span>
      ),
      description: idx === currentIdx ? (
        <span className="text-[11px]" style={{ color: B.mutedFg }}>{s.desc}</span>
      ) : null,
    };
  });

  return (
    <Steps
      direction="vertical"
      size="small"
      current={currentIdx}
      items={items}
    />
  );
}
