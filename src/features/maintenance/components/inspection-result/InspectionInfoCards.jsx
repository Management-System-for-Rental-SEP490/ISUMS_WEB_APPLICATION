import { useTranslation } from "react-i18next";
import { Phone, Calendar, Clock, FileText, Mail, MapPin } from "lucide-react";
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
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#5A7A6E" }}>
      {children}
    </p>
  );
}

function InfoRow({ icon, iconBg, iconColor, label, children }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: iconBg }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px]" style={{ color: "#5A7A6E" }}>{label}</p>
        <div className="text-xs font-semibold" style={{ color: "#1E2D28" }}>{children}</div>
      </div>
    </div>
  );
}

export default function InspectionInfoCards({ inspection, staff }) {
  const { t } = useTranslation("common");

  const staffInitial = staff?.name
    ? staff.name.trim().split(" ").pop()[0].toUpperCase()
    : "?";

  const roleLabel = staff?.roles?.[0]
    ? t(`inspection.infoCards.roles.${staff.roles[0]}`, { defaultValue: staff.roles[0] })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Staff card */}
      <Card>
        <CardTitle>{t("inspection.infoCards.staffTitle")}</CardTitle>
        {staff ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ background: "rgba(32,150,216,0.12)", color: "#2096d8" }}
              >
                {staffInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "#1E2D28" }}>
                  {staff.name}
                </p>
                {roleLabel && (
                  <span
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                    style={{ background: "rgba(32,150,216,0.10)", color: "#2096d8" }}
                  >
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px" style={{ background: "#EAF4F0" }} />

            <div className="space-y-2">
              {staff.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#3bb582" }} />
                  <a
                    href={`tel:${staff.phoneNumber}`}
                    className="text-xs transition"
                    style={{ color: "#5A7A6E" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#3bb582")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#5A7A6E")}
                  >
                    {staff.phoneNumber}
                  </a>
                </div>
              )}
              {staff.email && (
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#2096d8" }} />
                  <span className="text-xs truncate" style={{ color: "#5A7A6E" }}>{staff.email}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl animate-pulse flex-shrink-0" style={{ background: "#EAF4F0" }} />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-28 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
                <div className="h-2.5 w-20 rounded animate-pulse" style={{ background: "#EAF4F0" }} />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Time card */}
      <Card>
        <CardTitle>{t("inspection.infoCards.timeTitle")}</CardTitle>
        <div className="space-y-3">
          <InfoRow icon={Calendar} iconBg="#EAF4F0" iconColor="#3bb582" label={t("inspection.infoCards.createdAt")}>
            {formatDateTime(inspection?.createdAt)}
          </InfoRow>
          <div className="h-px" style={{ background: "#EAF4F0" }} />
          <InfoRow icon={Clock} iconBg="rgba(32,150,216,0.10)" iconColor="#2096d8" label={t("inspection.infoCards.updatedAt")}>
            {formatDateTime(inspection?.updatedAt)}
          </InfoRow>
        </div>
      </Card>

      {/* Note + Address card */}
      <Card>
        <CardTitle>{t("inspection.infoCards.extraTitle")}</CardTitle>
        <div className="space-y-3">
          <InfoRow icon={FileText} iconBg="#EAF4F0" iconColor="#5A7A6E" label={t("inspection.infoCards.noteLabel")}>
            {inspection?.note
              ? <span className="leading-relaxed font-normal">{inspection.note}</span>
              : <span style={{ color: "#9CA3AF", fontWeight: 400 }}>{t("inspection.infoCards.noteEmpty")}</span>
            }
          </InfoRow>
          {inspection?.houseAddress && (
            <>
              <div className="h-px" style={{ background: "#EAF4F0" }} />
              <InfoRow icon={MapPin} iconBg="rgba(59,181,130,0.08)" iconColor="#3bb582" label={t("inspection.infoCards.addressLabel")}>
                <span className="leading-relaxed font-normal">{inspection.houseAddress}</span>
              </InfoRow>
            </>
          )}
        </div>
      </Card>

    </div>
  );
}
