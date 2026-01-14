"use client";

import { useMemo, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;

  // Opcional: si querés arrancar con zoom 2x, etc.
  initialZoom?: number;
};

export default function ProductImageViewer({
  src,
  alt = "",
  className = "",
  initialZoom = 1,
}: Props) {
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [zoom, setZoom] = useState<number>(initialZoom);

  const transform = useMemo(() => {
    const sx = flipX ? -1 : 1;
    const sy = flipY ? -1 : 1;
    return `scale(${sx * zoom}, ${sy * zoom})`;
  }, [flipX, flipY, zoom]);

  function reset() {
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
  }

  function toggleFlipX() {
    setFlipX((v) => !v);
  }

  function toggleFlipY() {
    setFlipY((v) => !v);
  }

  function cycleZoom() {
    // 1x -> 2x -> 3x -> 1x
    setZoom((z) => {
      if (z < 2) return 2;
      if (z < 3) return 3;
      return 1;
    });
  }

  // Label compacto tipo "Zoom: 2x"
  const zoomLabel = `Zoom: ${zoom}x`;

  return (
    <div className={className}>
      {/* IMAGEN (sin overlays) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
        <div className="relative w-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto block object-cover origin-center"
            style={{
              transform,
              transition: "transform 160ms ease",
            }}
            loading="eager"
          />
        </div>
      </div>

      {/* CONTROLES DEBAJO (bloque normal) */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={toggleFlipX}
          aria-label="Odwróć poziomo"
          title="Odwróć poziomo"
          className="h-10 w-10 rounded-lg bg-[#c9b086] text-black font-semibold hover:opacity-90 transition inline-flex items-center justify-center"
        >
          ↔
        </button>

        <button
          type="button"
          onClick={toggleFlipY}
          aria-label="Odwróć pionowo"
          title="Odwróć pionowo"
          className="h-10 w-10 rounded-lg bg-[#c9b086] text-black font-semibold hover:opacity-90 transition inline-flex items-center justify-center"
        >
          ↕
        </button>

        <button
          type="button"
          onClick={cycleZoom}
          aria-label={zoomLabel}
          title={zoomLabel}
          className="h-10 w-10 rounded-lg bg-[#c9b086] text-black font-semibold hover:opacity-90 transition inline-flex items-center justify-center"
        >
          🔍
        </button>

        <button
          type="button"
          onClick={reset}
          className="h-10 px-4 rounded-lg border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}