import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({ images, index, onClose, onNext, onPrev }) {
  if (index === null || !images[index]) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: "rgba(30,45,40,0.85)" }}
      onClick={onClose}
    >
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-3 rounded-full transition-all duration-200 hover:scale-110"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <img
        src={images[index].url}
        alt="Ảnh đính kèm"
        className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 p-3 rounded-full transition-all duration-200 hover:scale-110"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full transition-all duration-200 hover:scale-110"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)" }}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
