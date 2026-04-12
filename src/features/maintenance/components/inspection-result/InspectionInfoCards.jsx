import { Phone, Calendar, Clock, FileText } from "lucide-react";
import { formatDateTime } from "../../constants/inspection.constants";

function Card({ children }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#ffffff",
        border: "1px solid #C4DED5",
        boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-widest mb-4"
      style={{ color: "#5A7A6E" }}
    >
      {children}
    </p>
  );
}

export default function InspectionInfoCards({ inspection }) {
  const staffInitial = inspection?.staffName
    ? inspection.staffName.trim().split(" ").pop()[0].toUpperCase()
    : "?";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Staff */}
      <Card>
        <CardTitle>Nhân viên được sắp xếp</CardTitle>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "rgba(32,150,216,0.12)", color: "#2096d8" }}
          >
            {staffInitial}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ color: "#1E2D28" }}
            >
              {inspection?.staffName ?? "—"}
            </p>
            {inspection?.staffPhone && (
              <a
                href={`tel:${inspection.staffPhone}`}
                className="inline-flex items-center gap-1 text-xs mt-0.5 transition"
                style={{ color: "#5A7A6E" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#3bb582")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5A7A6E")}
              >
                <Phone className="w-3 h-3" />
                {inspection.staffPhone}
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Time */}
      <Card>
        <CardTitle>Thời gian thực hiện</CardTitle>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "#EAF4F0" }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: "#3bb582" }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "#5A7A6E" }}>
                Ngày tạo
              </p>
              <p className="text-xs font-semibold" style={{ color: "#1E2D28" }}>
                {formatDateTime(inspection?.createdAt)}
              </p>
            </div>
          </div>
          <div className="h-px" style={{ background: "#EAF4F0" }} />
          <div className="flex items-start gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(32,150,216,0.10)" }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: "#2096d8" }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: "#5A7A6E" }}>
                Hoàn thành dự kiến
              </p>
              <p className="text-xs font-semibold" style={{ color: "#1E2D28" }}>
                {formatDateTime(inspection?.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Note */}
      <Card>
        <CardTitle>Ghi chú kiểm tra</CardTitle>
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "#EAF4F0" }}
          >
            <FileText className="w-3.5 h-3.5" style={{ color: "#5A7A6E" }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#1E2D28" }}>
            {inspection?.note || (
              <span style={{ color: "#9CA3AF" }}>Không có ghi chú</span>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
