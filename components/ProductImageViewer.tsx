"use client";

import * as React from "react";

type Img = {
  id?: number;
  src: string;
  alt?: string;
};

type Props = {
  images: Img[];
  productName: string;
};

const ZOOM_LEVELS = [1, 1.25, 1.5, 2] as const;

export default function ProductImageViewer({ images, productName }: Props) {
  const main = images?.[0]?.src || "";
  const [flipX, setFlipX] = React.useState(false);
  const [flipY, setFlipY] = React.useState(false);
  const [zoomIdx, setZoomIdx] = React.useState(0);

  const zoom = ZOOM_LEVELS[zoomIdx] ?? 1;

  const transform = React.useMemo(() => {
    // Aplicamos zoom + flips en una sola transformación
    const sx = (flipX ? -1 : 1) * zoom;
    const sy = (flipY ? -1 : 1) * zoom;
    return `translateZ(0) scaleX(${sx}) scaleY(${sy})`;
  }, [flipX, flipY, zoom]);

  const toggleZoom = () => {
    setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length);
  };

  const reset = () => {
    setFlipX(false);
    setFlipY(false);
    setZoomIdx(0);
  };

  if (!main) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
        <div className="p-14 text-white/50">No image</div>
      </div>
    );
  }

  return (
    <div className="self-start">
      {/* Imagen principal */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
        <div className="relative w-full">
          <img
            src={main}
            alt={productName}
            className="w-full h-auto block object-cover select-none"
            loading="eager"
            style={{
              transform,
              transformOrigin: "center center",
              willChange: "transform",
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setFlipX((v) => !v)}
          className="rounded-xl border border-white/15 bg-white/5 text-white/90 font-semibold px-4 py-2 hover:bg-white/10 transition"
          aria-label="Odwróć poziomo (lewo-prawo)"
          title="Odwróć poziomo (lewo-prawo)"
        >
          ↔ Odwróć
        </button>

        <button
          type="button"
          onClick={() => setFlipY((v) => !v)}
          className="rounded-xl border border-white/15 bg-white/5 text-white/90 font-semibold px-4 py-2 hover:bg-white/10 transition"
          aria-label="Odwróć pionowo (góra-dół)"
          title="Odwróć pionowo (góra-dół)"
        >
          ↕ Odwróć
        </button>

        <button
          type="button"
          onClick={toggleZoom}
          className="rounded-xl border border-white/15 bg-white/5 text-white/90 font-semibold px-4 py-2 hover:bg-white/10 transition"
          aria-label="Powiększenie"
          title="Powiększenie"
        >
          🔎 Zoom: {zoom}x
        </button>

        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-white/15 bg-white/5 text-white/70 font-semibold px-4 py-2 hover:bg-white/10 transition"
          aria-label="Resetuj"
          title="Resetuj"
        >
          Reset
        </button>
      </div>

      {/* Thumbs (si hay más de una imagen) */}
      {images?.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((img, idx) => (
            <div
              key={img.id ?? `${img.src}-${idx}`}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
              title={img.alt || productName}
            >
              <img
                src={img.src}
                alt={img.alt || productName}
                className="w-full h-16 block object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
