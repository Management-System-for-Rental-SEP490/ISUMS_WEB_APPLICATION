import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getJobById, getInspectionById } from "../../maintenance/api/maintenance.api";
import { getIssueByTicketId } from "../../issues/api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import { getUserById } from "../../tenants/api/users.api";
import { DAY_NAMES_LONG, MONTH_NAMES } from "../constants";
import SlotListView from "./slot-modal/SlotListView";
import SlotDetailView from "./slot-modal/SlotDetailView";

function formatDateVN(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayIdx = (d.getDay() + 6) % 7;
  const day = String(d.getDate()).padStart(2, "0");
  return `${DAY_NAMES_LONG[dayIdx]}, ${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Shared modal: list view → click row → detail view.
 * Props: dateStr "YYYY-MM-DD", timeSlot { start, end }, slots work-slot[], onClose () => void
 */
export default function SlotModal({ dateStr, timeSlot, slots, onClose }) {
  const [jobDetails, setJobDetails] = useState({});
  const [houseDetails, setHouseDetails] = useState({});
  const [staffDetails, setStaffDetails] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 200); };

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key !== "Escape") return;
      if (selectedSlot) setSelectedSlot(null);
      else handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot, visible]);

  // Fetch staff + jobs + houses
  useEffect(() => {
    setJobDetails({});
    setHouseDetails({});
    setStaffDetails({});
    setSelectedSlot(null);

    const uniqueStaffIds = [...new Set(slots.map((s) => s.staffId).filter(Boolean))];
    const uniqueJobIds = [...new Set(slots.map((s) => s.jobId).filter(Boolean))];
    const jobTypeMap = Object.fromEntries(slots.filter((s) => s.jobId).map((s) => [s.jobId, s.jobType]));

    const fetchStaff = uniqueStaffIds.length
      ? Promise.all(uniqueStaffIds.map((id) => getUserById(id).then((d) => ({ id, data: d })).catch(() => ({ id, data: null }))))
          .then((r) => setStaffDetails(Object.fromEntries(r.map(({ id, data }) => [id, data]))))
      : Promise.resolve();

    const fetchJobs = uniqueJobIds.length
      ? Promise.all(
          uniqueJobIds.map((id) => {
            const type = jobTypeMap[id]?.toUpperCase();
            const fetcher = type === "ISSUE" ? getIssueByTicketId(id) : type === "INSPECTION" ? getInspectionById(id) : getJobById(id);
            return fetcher.then((d) => ({ id, data: d })).catch(() => ({ id, data: null }));
          }),
        ).then((jobResults) => {
          setJobDetails(Object.fromEntries(jobResults.map(({ id, data }) => [id, data])));
          const uniqueHouseIds = [...new Set(jobResults.map(({ data }) => data?.houseId).filter(Boolean))];
          if (!uniqueHouseIds.length) return;
          return Promise.all(uniqueHouseIds.map((houseId) => getHouseById(houseId).then((d) => ({ houseId, data: d })).catch(() => ({ houseId, data: null }))))
            .then((r) => setHouseDetails(Object.fromEntries(r.map(({ houseId, data }) => [houseId, data]))));
        })
      : Promise.resolve();

    Promise.all([fetchStaff, fetchJobs]).catch(() => {});
  }, [slots]);

  const dateFmt = formatDateVN(dateStr);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ backgroundColor: "rgba(30,41,59,0.45)", backdropFilter: "blur(2px)", opacity: visible ? 1 : 0 }}
      onClick={() => { if (selectedSlot) setSelectedSlot(null); else handleClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all duration-200 ease-out"
        style={{ transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)", opacity: visible ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedSlot ? (
          <SlotDetailView
            slot={selectedSlot}
            jobDetails={jobDetails}
            houseDetails={houseDetails}
            staffDetails={staffDetails}
            onBack={() => setSelectedSlot(null)}
            onClose={handleClose}
          />
        ) : (
          <SlotListView
            slots={slots}
            jobDetails={jobDetails}
            houseDetails={houseDetails}
            staffDetails={staffDetails}
            onSelectSlot={setSelectedSlot}
            onClose={handleClose}
            dateFmt={dateFmt}
            timeSlot={timeSlot}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
