import { Steps } from "antd";
import { X } from "lucide-react";

const B = {
  green:   "#3bb582",
  fg:      "#1E2D28",
  mutedFg: "#5A7A6E",
  border:  "#C4DED5",
  muted:   "#EAF4F0",
};

const getStatusFlow = (t) => [
  { key: "CREATED",                        label: t("issues.timelineTitle"),                                  desc: t("issues.timelineDesc_CREATED") },
  { key: "SCHEDULED",                      label: t("issues.timelineTitle_SCHEDULED"),                        desc: t("issues.timelineDesc_SCHEDULED") },
  { key: "IN_PROGRESS",                    label: t("issues.timelineTitle_IN_PROGRESS"),                      desc: t("issues.timelineDesc_IN_PROGRESS") },
  { key: "WAITING_MANAGER_CONFIRM",        label: t("issues.timelineTitle_WAITING_MANAGER_CONFIRM"),          desc: t("issues.timelineDesc_WAITING_MANAGER_CONFIRM") },
  { key: "WAITING_MANAGER_APPROVAL_QUOTE", label: t("issues.timelineTitle_WAITING_MANAGER_APPROVAL_QUOTE"),   desc: t("issues.timelineDesc_WAITING_MANAGER_APPROVAL_QUOTE") },
  { key: "WAITING_TENANT_APPROVAL_QUOTE",  label: t("issues.timelineTitle_WAITING_TENANT_APPROVAL_QUOTE"),    desc: t("issues.timelineDesc_WAITING_TENANT_APPROVAL_QUOTE") },
  { key: "WAITING_PAYMENT",               label: t("issues.timelineTitle_WAITING_PAYMENT"),                  desc: t("issues.timelineDesc_WAITING_PAYMENT") },
  { key: "DONE",                           label: t("issues.timelineTitle_DONE"),                             desc: t("issues.timelineDesc_DONE") },
  { key: "CLOSED",                         label: t("issues.timelineTitle_CLOSED"),                           desc: t("issues.timelineDesc_CLOSED") },
];

export default function IssueTimeline({ status, t }) {
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
          <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{t("issues.timelineCancelled")}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(217,95,75,0.7)" }}>
            {t("issues.timelineCancelledDesc")}
          </p>
        </div>
      </div>
    );
  }

  const STATUS_FLOW = getStatusFlow(t);
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
