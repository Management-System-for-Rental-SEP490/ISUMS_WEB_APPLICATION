import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Check, X } from "lucide-react";

const MOCK_STAFF = [
  { id: "s1", name: "Nguyễn Văn A", specialtyType: "ELECTRICAL", available: true  },
  { id: "s2", name: "Trần Văn B",   specialtyType: "PLUMBING",   available: true  },
  { id: "s3", name: "Lê Thị C",     specialtyType: "HVAC",       available: false },
  { id: "s4", name: "Phạm Văn D",   specialtyType: "GENERAL",    available: true  },
  { id: "s5", name: "Hoàng Thị E",  specialtyType: "ELECTRICAL", available: false },
];

const TIME_SLOTS = [
  "07:00 – 09:00",
  "09:00 – 11:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
];

export default function AssignStaffModal({ open, job, onClose, onAssigned }) {
  const { t } = useTranslation("common");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedSlot,  setSelectedSlot]  = useState("");
  const [submitting, setSubmitting]       = useState(false);

  if (!open || !job) return null;

  const handleClose = () => {
    setSelectedStaff(null);
    setSelectedSlot("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedStaff || !selectedSlot) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    handleClose();
    onAssigned?.();
  };

  const canConfirm = !!selectedStaff && !!selectedSlot;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base font-bold text-slate-900">{t("maintenance.assignStaff.title")}</h3>
          <button type="button" onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t("maintenance.assignStaff.jobLabel")}</p>
            <p className="text-sm font-semibold text-slate-800">{job.title}</p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {job.scheduledDate}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              {t("maintenance.assignStaff.chooseStaff")}
            </p>
            <div className="space-y-2">
              {MOCK_STAFF.map((s) => (
                <button key={s.id} type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedStaff(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                    !s.available
                      ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-100"
                      : selectedStaff?.id === s.id
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                        : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-teal-700">{s.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${selectedStaff?.id === s.id ? "text-teal-700" : "text-slate-700"}`}>
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-400">{t(`maintenance.type.${s.specialtyType}`, { defaultValue: s.specialtyType })}</p>
                  </div>
                  {s.available ? (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {t("maintenance.assignStaff.available")}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 flex-shrink-0">{t("maintenance.assignStaff.busy")}</span>
                  )}
                  {selectedStaff?.id === s.id && (
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{t("maintenance.assignStaff.chooseTimeSlot")}</p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                    selectedSlot === slot
                      ? "border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-400"
                      : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-slate-50"
                  }`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
            {t("maintenance.assignStaff.cancel")}
          </button>
          <button type="button" onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
            {submitting ? t("maintenance.assignStaff.submitting") : t("maintenance.assignStaff.confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
