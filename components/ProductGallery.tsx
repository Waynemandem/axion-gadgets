"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="soft-card grid aspect-square place-items-center bg-[var(--blue-soft)] text-7xl">
        📱
      </div>
    );
  }

  return (
    <div>
      <div className="soft-card relative aspect-square overflow-hidden bg-[var(--blue-soft)]">
        <Image
          src={images[active]}
          alt={`${name} photo ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--blue-soft)] ${
                i === active ? "ring-2 ring-[var(--blue)]" : "opacity-70"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}