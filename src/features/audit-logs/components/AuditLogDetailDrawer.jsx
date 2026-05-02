import { useEffect, useState } from "react";
import { Drawer, Spin } from "antd";
import { getAuditLogByEventId } from "../api/audit-logs.api";

const STATUS_STYLE = {
  SUCCESS: { bg: "rgba(59,181,130,0.10)", color: "#3bb582" },
  FAILED:  { bg: "rgba(217,95,75,0.10)",  color: "#D95F4B" },
  ERROR:   { bg: "rgba(217,95,75,0.10)",  color: "#D95F4B" },
};

function StatusBadge({ value }) {
  const style = STATUS_STYLE[value?.toUpperCase()] ?? { bg: "rgba(90,122,110,0.08)", color: "#5A7A6E" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={style}>
      {value ?? "—"}
    </span>
  );
}

function Row({ label, value, isCode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5 py-3" style={{ borderBottom: "1px solid rgba(196,222,213,0.35)" }}>
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#5A7A6E" }}>{label}</span>
      {isCode ? (
        <pre className="text-xs rounded-lg px-3 py-2 mt-1 overflow-x-auto" style={{ background: "#EAF4F0", color: "#1E2D28" }}>
          {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
        </pre>
      ) : (
        <span className="text-sm font-medium break-all" style={{ color: "#1E2D28" }}>{String(value)}</span>
      )}
    </div>
  );
}

export default function AuditLogDetailDrawer({ eventId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    getAuditLogByEventId(eventId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <Drawer
      open={!!eventId}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: "#1E2D28" }}>Chi tiết Audit Log</span>
          {data?.status && <StatusBadge value={data.status} />}
        </div>
      }
      size={520}
      styles={{ body: { padding: "16px 24px" } }}
    >
      {loading && (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(217,95,75,0.08)", color: "#D95F4B" }}>
          {error}
        </div>
      )}

      {data && !loading && (
        <div>
          <div className="rounded-2xl px-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
            <Row label="Event ID"       value={data.eventId} />
            <Row label="Event Version"  value={data.eventVersion} />
            <Row label="Trace ID"       value={data.traceId} />
            <Row label="Request ID"     value={data.requestId} />
            <Row label="Correlation ID" value={data.correlationId} />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#5A7A6E" }}>Actor</p>
          <div className="rounded-2xl px-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
            <Row label="User ID"   value={data.actorUserId} />
            <Row label="Username"  value={data.actorUsername} />
            <Row label="Role"      value={data.actorRole} />
            <Row label="Type"      value={data.actorType} />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#5A7A6E" }}>Sự kiện</p>
          <div className="rounded-2xl px-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
            <Row label="Action"        value={data.action} />
            <Row label="Resource Type" value={data.resourceType} />
            <Row label="Resource ID"   value={data.resourceId} />
            <Row label="Service Name"  value={data.serviceName} />
            <Row label="Status"        value={data.status} />
            <Row label="Thời gian"     value={data.timestamp ? new Date(data.timestamp).toLocaleString("vi-VN") : data.createdAt ? new Date(data.createdAt).toLocaleString("vi-VN") : null} />
          </div>

          {(data.metadata || data.payload || data.details || data.requestBody || data.responseBody) && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#5A7A6E" }}>Dữ liệu</p>
              <div className="rounded-2xl px-4" style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}>
                <Row label="Metadata"      value={data.metadata}     isCode />
                <Row label="Payload"       value={data.payload}      isCode />
                <Row label="Details"       value={data.details}      isCode />
                <Row label="Request Body"  value={data.requestBody}  isCode />
                <Row label="Response Body" value={data.responseBody} isCode />
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}
