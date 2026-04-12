import { Carousel, Image } from "antd";
import { ImageOff } from "lucide-react";

/**
 * @param {{ images: { id: string, url: string }[], alt?: string, height?: string, showThumbnails?: boolean, preview?: boolean }} props
 */
const ImageCarousel = ({ images = [], alt = "image", height = "h-56", showThumbnails = true, preview = true }) => {
  if (!images.length) {
    return (
      <div className={`${height} bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-300`}>
        <ImageOff className="w-10 h-10" />
        <span className="text-xs">Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <Image.PreviewGroup>
      <div className="flex flex-col gap-0">
        {/* Main carousel */}
        <Carousel
          arrows={images.length > 1}
          infinite={false}
          dotPosition="bottom"
          dots={images.length > 1}
        >
          {images.map((img) => (
            <div key={img.id}>
              <div className={`${height} bg-gray-100 overflow-hidden`}>
                <Image
                  src={img.url}
                  alt={alt}
                  className="!w-full !h-full object-cover"
                  preview={preview ? { mask: "Xem ảnh" } : false}
                  wrapperClassName="!w-full !h-full"
                />
              </div>
            </div>
          ))}
        </Carousel>

        {/* Thumbnail strip */}
        {showThumbnails && images.length > 1 && (
          <div className="flex gap-1 p-1.5 bg-gray-50 overflow-x-auto">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 border-transparent opacity-60 hover:opacity-100 transition-opacity"
              >
                <img src={img.url} alt={alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </Image.PreviewGroup>
  );
};

export default ImageCarousel;
