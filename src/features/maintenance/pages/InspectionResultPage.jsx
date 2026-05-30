import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message, Spin } from "antd";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  getInspectionById,
  getAssetEventsByJob,
  updateInspectionStatus,
} from "../api/inspections.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import ImageCarousel from "../../../components/shared/ImageCarousel";
import InspectionHeader from "../components/inspection-result/InspectionHeader";
import InspectionHouseCard from "../components/inspection-result/InspectionHouseCard";
import InspectionInfoCards from "../components/inspection-result/InspectionInfoCards";
import AssetEventsTable from "../components/inspection-result/AssetEventsTable";
import InspectionConfirmModal from "../components/inspection-result/InspectionConfirmModal";

// Normalise inspection response → shape dùng trong UI
function toImageArray(photoUrls) {
  if (!Array.isArray(photoUrls)) return [];
  return photoUrls
    .map((url, i) => (url ? { id: `house-photo-${i}`, url } : null))
    .filter(Boolean);
}

function normaliseInspection(raw, house) {
  return {
    id: raw.id,
    assignedStaffId: raw.assignedStaffId ?? null,
    status: raw.status,
    type: raw.type,
    note: raw.note ?? raw.inspectionNotes ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? null,
    scheduledAt: raw.scheduledAt ?? raw.completedAt ?? null,
    houseAddress: house
      ? [house.address, house.ward, house.commune, house.city]
          .filter(Boolean)
          .join(", ")
      : (raw.houseAddress ?? null),
    houseThumbnail:
      house?.thumbnail ??
      house?.thumbnailUrl ??
      house?.images?.[0]?.url ??
      house?.images?.[0] ??
      null,
    jobId: raw.jobId ?? null,
    houseId: raw.houseId ?? null,
    housePhotos: toImageArray(raw.housePhotoUrls),
  };
}

// Normalise asset event → shape dùng trong AssetRow
function normaliseEvent(raw) {
  return {
    id: raw.id ?? raw.assetId ?? Math.random().toString(),
    assetName: raw.assetName ?? "—",
    assetCode: raw.assetCode ?? raw.assetId ?? null,
    eventType: raw.eventType ?? "MAINTENANCE",
    previousCondition:
      raw.previousCondition ?? raw.previousConditionPercent ?? null,
    currentCondition:
      raw.currentCondition ??
      raw.conditionPercent ??
      raw.currentConditionPercent ??
      null,
    note: raw.note ?? null,
    createdAt: raw.createdAt ?? null,
    oldImages: Array.isArray(raw.oldImages) ? raw.oldImages : [],
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

export default function InspectionResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [inspection, setInspection] = useState(null);
  const [house, setHouse] = useState(null);
  const [staff, setStaff] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingInspection, setLoadingInspection] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoadingInspection(true);
    setError(null);
    try {
      const raw = await getInspectionById(id);

      // Fetch house + staff in parallel
      const [houseData, staffData] = await Promise.all([
        raw.houseId ? getHouseById(raw.houseId).catch(() => null) : null,
        raw.assignedStaffId
          ? getUserById(raw.assignedStaffId).catch(() => null)
          : null,
      ]);

      setInspection(normaliseInspection(raw, houseData));
      setHouse(houseData);
      setStaff(staffData);

      // Fetch asset events — dùng jobId nếu có, fallback về inspection id
      const jobId = raw.jobId ?? id;
      if (jobId) {
        setLoadingEvents(true);
        getAssetEventsByJob(jobId)
          .then((list) => setEvents(list.map(normaliseEvent)))
          .catch(() => setEvents([]))
          .finally(() => setLoadingEvents(false));
      }
    } catch (err) {
      setError(err.message ?? t("inspection.loadError"));
    } finally {
      setLoadingInspection(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await updateInspectionStatus(id, "APPROVED");
      message.success(t("inspection.approveSuccess"));
      setConfirmOpen(false);
      navigate(-1);
    } catch (err) {
      message.error(err.message ?? t("inspection.approveError"));
    } finally {
      setApproving(false);
    }
  };

  // ── Loading ──
  if (loadingInspection) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(217,95,75,0.10)" }}
        >
          <AlertCircle className="w-7 h-7" style={{ color: "#D95F4B" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>
          {error}
        </p>
        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
        >
          <RefreshCw className="w-4 h-4" /> {t("inspection.btnRetry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <InspectionHeader
        inspection={inspection}
        id={id}
        onComplete={() => setConfirmOpen(true)}
      />
      <InspectionHouseCard house={house} />
      <InspectionInfoCards inspection={inspection} staff={staff} />
      <section
        aria-label={t("inspection.resultDrawer.photoLabel")}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #C4DED5",
          boxShadow: "0 2px 8px -2px rgba(59,181,130,0.06)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(196,222,213,0.5)" }}
        >
          <p className="text-sm font-bold" style={{ color: "#1E2D28" }}>
            {t("inspection.resultDrawer.photoLabel")}
          </p>
          {inspection?.housePhotos?.length > 0 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#EAF4F0", color: "#3bb582" }}
            >
              {String(inspection.housePhotos.length).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="p-5">
          {inspection?.housePhotos?.length > 0 ? (
            <ImageCarousel
              images={inspection.housePhotos}
              alt={t("inspection.resultDrawer.photoLabel")}
              height="h-64"
            />
          ) : (
            <div
              className="h-40 rounded-xl flex items-center justify-center"
              style={{ background: "#F7FBF9" }}
            >
              <p className="text-xs" style={{ color: "#8ab5a3" }}>
                {t("inspection.assetEvents.noImage")}
              </p>
            </div>
          )}
        </div>
      </section>
      <AssetEventsTable events={events} loading={loadingEvents} />
      <InspectionConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleApprove}
        loading={approving}
      />
    </div>
  );
}
