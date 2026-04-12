import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getInspectionById, getAssetEventsByJob, updateInspectionStatus } from "../api/inspections.api";
import { getHouseById } from "../../houses/api/houses.api";
import InspectionHeader from "../components/inspection-result/InspectionHeader";
import InspectionInfoCards from "../components/inspection-result/InspectionInfoCards";
import AssetEventsTable from "../components/inspection-result/AssetEventsTable";
import InspectionHistoryTimeline from "../components/inspection-result/InspectionHistoryTimeline";
import InspectionConfirmModal from "../components/inspection-result/InspectionConfirmModal";

// Normalise inspection response → shape dùng trong UI
function normaliseInspection(raw, house) {
  return {
    id: raw.id,
    staffName: raw.staffName ?? raw.staff?.name ?? null,
    staffPhone: raw.staffPhone ?? raw.staff?.phoneNumber ?? null,
    status: raw.status,
    type: raw.type,
    note: raw.note ?? raw.inspectionNotes ?? null,
    createdAt: raw.createdAt,
    scheduledAt: raw.scheduledAt ?? raw.completedAt ?? null,
    houseAddress: house
      ? [house.address, house.ward, house.commune, house.city].filter(Boolean).join(", ")
      : (raw.houseAddress ?? null),
    houseThumbnail: house?.thumbnail ?? house?.thumbnailUrl ?? house?.images?.[0]?.url ?? house?.images?.[0] ?? null,
    jobId: raw.jobId ?? null,
    houseId: raw.houseId ?? null,
  };
}

// Normalise asset event → shape dùng trong AssetRow
function normaliseEvent(raw) {
  return {
    id: raw.id ?? raw.assetId ?? Math.random().toString(),
    assetName: raw.assetName ?? "—",
    assetCode: raw.assetCode ?? raw.assetId ?? null,
    eventType: raw.eventType ?? "MAINTENANCE",
    previousCondition: raw.previousCondition ?? raw.previousConditionPercent ?? null,
    currentCondition: raw.currentCondition ?? raw.conditionPercent ?? raw.currentConditionPercent ?? null,
    note: raw.note ?? null,
    createdAt: raw.createdAt ?? null,
    oldImages: Array.isArray(raw.oldImages) ? raw.oldImages : [],
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

export default function InspectionResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
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

      // Fetch house details in parallel if houseId exists
      const house = raw.houseId
        ? await getHouseById(raw.houseId).catch(() => null)
        : null;

      setInspection(normaliseInspection(raw, house));

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
      setError(err.message ?? "Không thể tải dữ liệu kiểm tra.");
    } finally {
      setLoadingInspection(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await updateInspectionStatus(id, "APPROVED");
      message.success("Xác nhận hoàn thành kiểm tra thành công!");
      setConfirmOpen(false);
      navigate(-1);
    } catch (err) {
      message.error(err.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
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
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(217,95,75,0.10)" }}>
          <AlertCircle className="w-7 h-7" style={{ color: "#D95F4B" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#D95F4B" }}>{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{ border: "1px solid #C4DED5", color: "#5A7A6E" }}
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <InspectionHeader inspection={inspection} id={id} onComplete={() => setConfirmOpen(true)} />
      <InspectionInfoCards inspection={inspection} />
      <AssetEventsTable events={events} loading={loadingEvents} />
      <InspectionHistoryTimeline history={[]} inspection={inspection} />
      <InspectionConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleApprove}
        loading={approving}
      />
    </div>
  );
}
