import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import {
  confirmStaffWorkSlot,
  confirmIssueWorkSlot,
  createManualWorkSlot,
  getAvailableSlotsByJob,
  getAvailableStaffForSlot,
} from "../api/schedule.api";
import {
  getMaintenanceJobsByStatus,
  getMaintenancePlanById,
  getInspections,
} from "../../maintenance/api/maintenance.api";
import { getAllIssues } from "../../issues/api/issues.api";
import { getHouseById } from "../../houses/api/houses.api";
import StepIndicator from "./create-shift/StepIndicator";
import Step1JobSelect from "./create-shift/Step1JobSelect";
import Step2TimeSlot from "./create-shift/Step2TimeSlot";
import Step3Staff from "./create-shift/Step3Staff";

export default function CreateShiftModal({ open, onClose, onCreated }) {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1
  const [jobType, setJobType] = useState("MAINTENANCE");
  const [jobs, setJobs] = useState([]);
  const [planNames, setPlanNames] = useState({});
  const [houseNames, setHouseNames] = useState({});
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobSearch, setJobSearch] = useState("");

  // Step 2
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Step 3
  const [staffMode, setStaffMode] = useState("auto");
  const [availableStaff, setAvailableStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ── Animation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setJobType("MAINTENANCE");
    setSelectedJobId(null);
    setSelectedDate("");
    setTimeSlots([]);
    setSelectedSlot(null);
    setStaffMode("auto");
    setAvailableStaff([]);
    setSelectedStaffId(null);
    setError(null);
    setJobSearch("");
     
  }, [open]);

  // ── ESC key ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Reset staffMode when jobType changes ───────────────────────────────────
  useEffect(() => {
    setStaffMode("auto");
  }, [jobType]);

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSelectedJobId(null);
    setJobSearch("");
    setJobsLoading(true);
    const fetcher =
      jobType === "ISSUE"
        ? getAllIssues({ status: "WAITING_MANAGER_CONFIRM", type: "REPAIR" })
        : jobType === "INSPECTION"
          ? getInspections({ status: "CREATED" })
          : getMaintenanceJobsByStatus("CREATED");
    fetcher
      .then(async (data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
        setJobs(list);
        if (jobType === "MAINTENANCE") {
          const planIds = [...new Set(list.map((j) => j.planId).filter(Boolean))];
          const houseIds = [...new Set(list.map((j) => j.houseId).filter(Boolean))];
          const [planRes, houseRes] = await Promise.all([
            Promise.allSettled(planIds.map((id) => getMaintenancePlanById(id))),
            Promise.allSettled(houseIds.map((id) => getHouseById(id))),
          ]);
          const pm = {};
          planRes.forEach((r, i) => { if (r.status === "fulfilled") pm[planIds[i]] = r.value?.name; });
          setPlanNames(pm);
          const hm = {};
          houseRes.forEach((r, i) => { if (r.status === "fulfilled") hm[houseIds[i]] = r.value?.name ?? r.value?.houseName ?? "—"; });
          setHouseNames(hm);
        }
        if (jobType === "INSPECTION") {
          const houseIds = [...new Set(list.map((j) => j.houseId).filter(Boolean))];
          const houseRes = await Promise.allSettled(houseIds.map((id) => getHouseById(id)));
          const hm = {};
          houseRes.forEach((r, i) => { if (r.status === "fulfilled") hm[houseIds[i]] = r.value?.name ?? r.value?.houseName ?? "—"; });
          setHouseNames(hm);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, [open, jobType]);

  // ── Fetch slots on job+date change ─────────────────────────────────────────
  useEffect(() => {
    setSelectedSlot(null);
    setTimeSlots([]);
    if (!selectedJobId || !selectedDate) return;
    setSlotsLoading(true);
    getAvailableSlotsByJob(selectedJobId, selectedDate)
      .then((slots) =>
        setTimeSlots(
          slots.map((s) => ({
            start: s.startTime.substring(0, 5),
            end: s.endTime.substring(0, 5),
            startRaw: s.startTime,
            status: s.status,
            availableStaffCount: s.availableStaffCount ?? 0,
          })),
        ),
      )
      .catch(() => setTimeSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedJobId, selectedDate]);

  // ── Fetch staff when entering step 3 ──────────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !selectedJobId || !selectedDate || !selectedSlot) return;
    setAvailableStaff([]);
    setSelectedStaffId(null);
    setStaffLoading(true);
    getAvailableStaffForSlot(selectedJobId, selectedDate, selectedSlot.startRaw)
      .then((list) => setAvailableStaff(list))
      .catch(() => setAvailableStaff([]))
      .finally(() => setStaffLoading(false));
  }, [step, selectedJobId, selectedDate, selectedSlot]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedSlot || !selectedDate) return;
    setError(null);
    setSubmitting(true);
    try {
      const startTime = `${selectedDate}T${selectedSlot.start}:00`;
      if (staffMode === "manual") {
        await createManualWorkSlot({ jobId: selectedJobId, staffId: selectedStaffId, startTime, jobType });
      } else if (jobType === "MAINTENANCE" || jobType === "INSPECTION") {
        await confirmStaffWorkSlot({ jobId: selectedJobId, startTime });
      } else {
        await confirmIssueWorkSlot(selectedJobId);
      }
      toast.success(t("schedule.createShiftSuccess", { date: selectedDate, time: selectedSlot.start }));
      onCreated?.();
      handleClose();
    } catch (e) {
      const msg = e.message?.toLowerCase();
      const finalMsg = msg?.includes("staff already has job in this time")
        ? t("schedule.errorStaffBusy")
        : (e.message ?? t("schedule.errorGeneric"));
      setError(finalMsg);
      toast.error(finalMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const canGoStep2 = !!selectedJobId;
  const canGoStep3 = !!selectedSlot;
  const canSubmit = !submitting && (staffMode === "auto" || !!selectedStaffId);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 700, maxHeight: "92vh",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms cubic-bezier(0.34,1.2,0.64,1), opacity 300ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{t("schedule.createShiftTitle")}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t("schedule.createShiftSubtitle")}</p>
            </div>
            <button type="button" onClick={handleClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <StepIndicator current={step} />
        </div>

        {/* Submit overlay */}
        {submitting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
              <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700">{t("schedule.creating")}</p>
            <p className="text-xs text-slate-400">{t("schedule.creatingHint", { defaultValue: "Vui lòng đợi..." })}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {step === 1 && (
            <Step1JobSelect
              jobType={jobType} setJobType={setJobType}
              jobs={jobs} jobsLoading={jobsLoading}
              selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId}
              jobSearch={jobSearch} setJobSearch={setJobSearch}
              planNames={planNames} houseNames={houseNames}
            />
          )}
          {step === 2 && (
            <Step2TimeSlot
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              timeSlots={timeSlots} slotsLoading={slotsLoading}
              selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot}
            />
          )}
          {step === 3 && (
            <Step3Staff
              staffMode={staffMode} setStaffMode={setStaffMode}
              availableStaff={availableStaff} staffLoading={staffLoading}
              selectedStaffId={selectedStaffId} setSelectedStaffId={setSelectedStaffId}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            {step > 1 && <ChevronLeft className="w-4 h-4" />}
            {step === 1 ? t("actions.cancel") : t("actions.back")}
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 ? !canGoStep2 : !canGoStep3}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("schedule.next")} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? t("schedule.creating") : <><CheckCircle2 className="w-4 h-4" /> {t("schedule.createShiftFinish")}</>}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
