import { useState, useEffect, useCallback } from "react";
import { UserCheck, RefreshCw, Wrench } from "lucide-react";
import { getAllIssues, getIssueById } from "../api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import { confirmManagerWorkSlot } from "../../maintenance/api/maintenance.api";
import { toast } from "react-toastify";
import IssueListPanel from "../components/assignment/IssueListPanel";
import IssueDetailPanel from "../components/assignment/IssueDetailPanel";
import ImageLightbox from "../components/assignment/ImageLightbox";

const B = {
  green: "#3bb582", card: "#FFFFFF", muted: "#EAF4F0",
  border: "#C4DED5", fg: "#1E2D28", mutedFg: "#5A7A6E",
  gradient: "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)",
};

export default function IssueAssignmentPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [houseNames, setHouseNames] = useState({});
  const [staffDetail, setStaffDetail] = useState(null);
  const [images, setImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIssues({ type: "REPAIR", status: "WAITING_MANAGER_CONFIRM" });
      const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      setIssues(list);
      if (list.length > 0) setSelected(list[0]);
      const ids = [...new Set(list.map((i) => i.houseId).filter(Boolean))];
      const entries = await Promise.all(
        ids.map((id) => getHouseById(id).then((h) => [id, h?.name ?? h?.houseName ?? "—"]).catch(() => [id, "—"])),
      );
      setHouseNames(Object.fromEntries(entries));
    } catch (err) {
      setError(err?.message ?? "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleSelectIssue = async (issue) => {
    setSelected(issue);
    setSelectedDetail(null);
    setStaffDetail(null);
    setImages(Array.isArray(issue.images) ? issue.images : []);
    setDetailLoading(true);
    try {
      const detail = await getIssueById(issue.id);
      setSelectedDetail(detail);
      if (Array.isArray(detail?.images) && detail.images.length > 0) {
        setImages(detail.images);
      }
      if (detail?.houseId && !houseNames[detail.houseId]) {
        getHouseById(detail.houseId)
          .then((h) => setHouseNames((prev) => ({ ...prev, [detail.houseId]: h?.name ?? h?.houseName ?? "—" })))
          .catch(() => {});
      }
      if (detail?.assignedStaffId) {
        getUserById(detail.assignedStaffId).then((s) => setStaffDetail(s)).catch(() => {});
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
      setSelected(null);
      setSelectedDetail(null);
      setStaffDetail(null);
      setImages([]);
      fetchIssues();
    } catch (e) {
      toast.error(e.message ?? "Xác nhận thất bại, vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  const detail = selectedDetail ?? selected;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: B.muted }}>
              <UserCheck className="w-3.5 h-3.5" style={{ color: B.green }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: B.green }}>Sửa chữa</span>
          </div>
          <h2 className="font-heading text-3xl font-bold" style={{ color: B.fg }}>Phân công xử lý</h2>
        </div>
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: B.muted, color: B.green, border: `1px solid ${B.border}` }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between" style={{ background: "rgba(217,95,75,0.08)", border: "1px solid rgba(217,95,75,0.25)" }}>
          <p className="text-sm font-medium" style={{ color: "#D95F4B" }}>{error}</p>
          <button onClick={fetchIssues} className="text-xs font-semibold underline" style={{ color: "#D95F4B" }}>Thử lại</button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        <IssueListPanel issues={issues} loading={loading} selected={selected} onSelect={handleSelectIssue} />

        {!loading && detail ? (
          <IssueDetailPanel
            detail={detail}
            houseNames={houseNames}
            staffDetail={staffDetail}
            images={images}
            imagesLoading={detailLoading}
            onConfirm={handleConfirm}
            confirming={confirming}
            onOpenLightbox={setLightboxIndex}
          />
        ) : (
          !loading && (
            <div
              className="flex-1 rounded-2xl flex items-center justify-center py-24"
              style={{ background: B.card, border: `1px solid ${B.border}`, boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: B.muted }}>
                  <Wrench className="w-7 h-7" style={{ color: B.green }} />
                </div>
                <p className="text-sm font-medium" style={{ color: B.mutedFg }}>Chọn một yêu cầu để xem chi tiết</p>
              </div>
            </div>
          )
        )}
      </div>

      <ImageLightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
        onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
      />
    </div>
  );
}
