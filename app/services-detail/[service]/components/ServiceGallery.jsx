"use client";
import { useState, useEffect } from "react";

export default function ServiceImageGallery({ images = [] }) {
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    setMainImage(images[0] || "/fallback.png");
  }, [images]);

  const getImageUrl = (img) => img ? `${process.env.RENDER_BASE}${img}` : "/fallback.png";

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-video overflow-hidden rounded-lg border border-slate-200">
        <img
          src={getImageUrl(mainImage)}
          alt="Service"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`aspect-square rounded-md overflow-hidden border-2 ${
              mainImage === img ? "border-green-500" : "border-transparent"
            }`}
          >
            <img
              src={getImageUrl(img)}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
