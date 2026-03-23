import { useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";

const MAX_IMAGES = 10;

export default function HouseImageUploader({ onImagesChange }) {
  const [images,   setImages]   = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const addFiles = (files) => {
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => {
      const next = [...prev, ...incoming].slice(0, MAX_IMAGES);
      onImagesChange?.(next);
      return next;
    });
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      onImagesChange?.(next);
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Hình ảnh bất động sản</h3>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-10 transition ${
          dragging
            ? "border-teal-400 bg-teal-50"
            : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
          <ImagePlus className="w-6 h-6 text-teal-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Kéo thả hoặc chọn ảnh</p>
          <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP · Tối đa {MAX_IMAGES} ảnh</p>
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  Ảnh bìa
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-teal-300 hover:bg-slate-50 transition"
            >
              <Plus className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
