"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  widthCm: number;
  heightCm: number;
  maxPanelWidthCm?: number;
  draggable?: boolean;
  className?: string;

  /** ✅ para corregir drag invertido al espejar */
  flipX?: boolean;
  flipY?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Size = { w: number; h: number };

export default function FototapetyCropOverlay({
  widthCm,
  heightCm,
  maxPanelWidthCm = 100,
  draggable = true,
  className,
  flipX = false,
  flipY = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [host, setHost] = useState<Size>({ w: 0, h: 0 });

  // posición manual (en porcentaje para que sobreviva al resize)
  const [manualPosPct, setManualPosPct] = useState<{ x: number; y: number } | null>(
    null
  );

  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    pointerId: number | null;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    pointerId: null,
  });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setHost({ w: Math.round(r.width), h: Math.round(r.height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ratio = useMemo(() => {
    const w = Number(widthCm) || 1;
    const h = Number(heightCm) || 1;
    return w / h;
  }, [widthCm, heightCm]);

  const cropSize = useMemo(() => {
    const overlayW = host.w;
    const overlayH = host.h;
    if (!overlayW || !overlayH || ratio <= 0) {
      return { w: 0, h: 0 };
    }

    let newW = overlayW;
    let newH = newW / ratio;

    if (newH > overlayH) {
      newH = overlayH;
      newW = newH * ratio;
    }

    return { w: Math.round(newW), h: Math.round(newH) };
  }, [host.w, host.h, ratio]);

  const cropPosPx = useMemo(() => {
    const overlayW = host.w;
    const overlayH = host.h;
    const boxW = cropSize.w;
    const boxH = cropSize.h;

    if (!overlayW || !overlayH || !boxW || !boxH) {
      return { left: 0, top: 0 };
    }

    let left = (overlayW - boxW) / 2;
    let top = (overlayH - boxH) / 2;

    if (manualPosPct) {
      left = (manualPosPct.x / 100) * overlayW;
      top = (manualPosPct.y / 100) * overlayH;
    }

    left = clamp(left, 0, overlayW - boxW);
    top = clamp(top, 0, overlayH - boxH);

    return { left: Math.round(left), top: Math.round(top) };
  }, [host.w, host.h, cropSize.w, cropSize.h, manualPosPct]);

  const panels = useMemo(() => {
    const w = Number(widthCm) || 1;
    const cap = Number(maxPanelWidthCm) > 0 ? Number(maxPanelWidthCm) : 100;
    const count = Math.max(1, Math.ceil(w / cap));
    return { count };
  }, [widthCm, maxPanelWidthCm]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragRef.current.dragging = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.startLeft = cropPosPx.left;
    dragRef.current.startTop = cropPosPx.top;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || !dragRef.current.dragging) return;

    const overlayW = host.w;
    const overlayH = host.h;
    const boxW = cropSize.w;
    const boxH = cropSize.h;
    if (!overlayW || !overlayH || !boxW || !boxH) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // ✅ corrección por flip
    const dxEff = flipX ? -dx : dx;
    const dyEff = flipY ? -dy : dy;

    let nextLeft = dragRef.current.startLeft + dxEff;
    let nextTop = dragRef.current.startTop + dyEff;

    nextLeft = clamp(nextLeft, 0, overlayW - boxW);
    nextTop = clamp(nextTop, 0, overlayH - boxH);

    setManualPosPct({
      x: (nextLeft / overlayW) * 100,
      y: (nextTop / overlayH) * 100,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;

    dragRef.current.dragging = false;
    dragRef.current.pointerId = null;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const overlayClipPath = useMemo(() => {
    const W = host.w;
    const H = host.h;
    const L = cropPosPx.left;
    const T = cropPosPx.top;
    const BW = cropSize.w;
    const BH = cropSize.h;

    if (!W || !H || !BW || !BH) return "none";

    const R = L + BW;
    const B = T + BH;

    return `polygon(evenodd,
      0 0,
      ${W}px 0,
      ${W}px ${H}px,
      0 ${H}px,
      0 0,

      ${L}px ${T}px,
      ${R}px ${T}px,
      ${R}px ${B}px,
      ${L}px ${B}px,
      ${L}px ${T}px
    )`;
  }, [host.w, host.h, cropPosPx, cropSize]);

  return (
    <div
      ref={hostRef}
      className={[
        "absolute inset-0 z-20 pointer-events-none",
        className || "",
      ].join(" ")}
    >
      {/* Overlay oscuro */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.45)",
          clipPath: overlayClipPath,
          WebkitClipPath: overlayClipPath as any,
        }}
      />

      {/* Área de recorte */}
      <div
        className="pointer-events-auto absolute"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          left: cropPosPx.left,
          top: cropPosPx.top,
          width: cropSize.w,
          height: cropSize.h,
          border: "3px dashed #c9b086",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4) inset",
          cursor: draggable ? "move" : "default",
          animation: "mm-dash 1.4s ease-in-out infinite",
        }}
      >
        {/* divisiones (bryty) */}
        {panels.count > 1 &&
          Array.from({ length: panels.count - 1 }).map((_, i) => {
            const leftPct = ((i + 1) / panels.count) * 100;
            return (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${leftPct}%`,
                  borderRight: "2px dashed rgba(201,176,134,0.9)",
                }}
              />
            );
          })}
      </div>

      <style jsx global>{`
        @keyframes mm-dash {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
