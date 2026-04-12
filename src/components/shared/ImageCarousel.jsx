import { useState } from "react";
import { Image } from "antd";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * @param {{ images: { id: string, url: string }[], alt?: string, height?: string, showThumbnails?: boolean, preview?: boolean }} props
 */
const ImageCarousel = ({ images = [], alt = "image", height = "h-56", showThumbnails = true, preview = true }) => {
  const [current, setCurrent] = useState(0);

  if (!images.length) {
    return (
      <div className={`${height} bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-300`}>
        <ImageOff className="w-10 h-10" />
        <span className="text-xs">Chưa có ảnh</span>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <Image.PreviewGroup>
      <div className="flex flex-col gap-0">
        {/* Main image */}
        <div className={`relative ${height} bg-gray-100 overflow-hidden group`}>
          <Image
            src={images[current].url}
            alt={alt}
            className="!w-full !h-full object-cover"
            preview={preview ? { mask: "Xem ảnh" } : false}
            wrapperClassName="!w-full !h-full"
          />

          {/* Counter — chỉ hiện khi có >1 ảnh */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[11px] px-2 py-0.5 rounded-full pointer-events-none">
              {current + 1}/{images.length}
            </div>
          )}

          {/* Arrows — chỉ hiện khi có >1 ảnh */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {showThumbnails && images.length > 1 && (
          <div className="flex gap-1 p-1.5 bg-gray-50 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-colors ${
                  i === current ? "border-teal-500" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt={alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Image.PreviewGroup>
  );
};

export default ImageCarousel;
