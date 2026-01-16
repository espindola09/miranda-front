"use client";

import React, { useMemo, useState } from "react";

/* ✅ NUEVO: overlay de recorte (drag + bryty) */
import FototapetyCropOverlay from "@/components/fototapety/FototapetyCropOverlay";

type Img = { id?: number; src: string; alt?: string };

type Props = {
  productName: string;
  images: Img[];

  maxWidthCm: number;
  maxHeightCm: number;

  defaultWidthCm?: number;
  defaultHeightCm?: number;

  // panel width cap (como tu lógica: 100cm por panel)
  maxPanelWidthCm?: number;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ✅ Stepper input (flechas como spinner, sin depender del browser)
function StepperInput({
  value,
  onChange,
  onBlur,
  min = 1,
  max = 9999,
  placeholder,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
  ariaLabel: string;
}) {
  const safeValue = Number.isFinite(value) ? value : min;

  const setClamped = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange(clamped);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        value={String(safeValue)}
        onChange={(e) => {
          const raw = e.target.value;

          // Permite borrar temporalmente sin romper (dejamos el último valor válido)
          if (raw.trim() === "") {
            onChange(min);
            return;
          }

          const onlyDigits = raw.replace(/[^\d]/g, "");
          if (onlyDigits === "") {
            onChange(min);
            return;
          }

          const n = Number(onlyDigits);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={onBlur}
        className="w-full rounded-xl bg-white border border-black/15 px-4 py-3 pr-12 outline-none text-black placeholder:text-black/40 focus:border-[#c9b086]"
        placeholder={placeholder}
        aria-label={ariaLabel}
      />

      {/* Flechas estilo spinner */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-md border border-black/15 bg-white">
        <button
          type="button"
          aria-label="Increase"
          className="h-5 w-7 grid place-items-center text-black/70 hover:text-black hover:bg-black/5 transition"
          onClick={() => setClamped(safeValue + 1)}
        >
          <span className="text-[10px] leading-none">▲</span>
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          aria-label="Decrease"
          className="h-5 w-7 grid place-items-center text-black/70 hover:text-black hover:bg-black/5 transition"
          onClick={() => setClamped(safeValue - 1)}
        >
          <span className="text-[10px] leading-none">▼</span>
        </button>
      </div>
    </div>
  );
}

// Íconos inline (sin dependencias)
function IconFlipX() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h2v10H7V7Zm8.5 0L21 12l-5.5 5v-3H11v-4h4.5V7ZM3 12l5.5-5v3H13v4H8.5v3L3 12Z"
      />
    </svg>
  );
}

function IconFlipY() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h10v2H7V7Zm0 8h10v2H7v-2Zm5-12 5 5h-3.5V12h-3V8H7l5-5Zm0 18-5-5h3.5V12h3v4H17l-5 5Z"
      />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 18a8 8 0 1 1 5.29-14.01A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-6-6a6 6 0 0 0 6 6Zm11 5-5.2-5.2 1.4-1.4L22.4 19.6 21 21Zm-12-9h2V9h2V7h-2V5H9v2H7v2h2v3Z"
      />
    </svg>
  );
}

export default function FototapetyConfigurator({
  productName,
  images,
  maxWidthCm,
  maxHeightCm,
  defaultWidthCm = 70,
  defaultHeightCm = 100,
  maxPanelWidthCm = 100,
}: Props) {
  // Imagen seleccionada (thumbs)
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images?.[activeIdx]?.src || "";

  // Transformaciones (flip/zoom)
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Medidas input
  const [w, setW] = useState<number>(defaultWidthCm);
  const [h, setH] = useState<number>(defaultHeightCm);

  // Normalización de máximos (si WP no los tiene aún)
  const maxW = Number.isFinite(maxWidthCm) && maxWidthCm > 0 ? maxWidthCm : 0;
  const maxH = Number.isFinite(maxHeightCm) && maxHeightCm > 0 ? maxHeightCm : 0;

  // Validación/clamp: 1..max (si max > 0); si no hay max, 1..9999
  const wClamped = useMemo(() => {
    const upper = maxW > 0 ? maxW : 9999;
    return clamp(Number(w || 0), 1, upper);
  }, [w, maxW]);

  const hClamped = useMemo(() => {
    const upper = maxH > 0 ? maxH : 9999;
    return clamp(Number(h || 0), 1, upper);
  }, [h, maxH]);

  // Cálculos: Powierzchnia / Wymiary / Bryty
  const areaM2 = useMemo(
    () => round2((wClamped * hClamped) / 10000),
    [wClamped, hClamped]
  );

  const panels = useMemo(() => {
    // ✅ PROTECCIÓN: maxPanelWidthCm puede venir undefined/0
    const safeMaxPanel =
      Number.isFinite(maxPanelWidthCm) && maxPanelWidthCm > 0
        ? maxPanelWidthCm
        : 100;

    // cantidad de paneles: ceil(width / maxPanelWidth)
    const panelCount = Math.max(1, Math.ceil(wClamped / safeMaxPanel));
    // ancho del panel redondeado (como tu ejemplo)
    const panelWidth = Math.round(wClamped / panelCount);
    return { panelCount, panelWidth };
  }, [wClamped, maxPanelWidthCm]);

  const onReset = () => {
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
    setW(defaultWidthCm);
    setH(defaultHeightCm);
  };

  const cycleZoom = () => {
    // 1x -> 1.5x -> 2x -> 1x
    setZoom((z) => {
      if (z < 1.5) return 1.5;
      if (z < 2) return 2;
      return 1;
    });
  };

  // ✅ Unificamos orden para que sea estable y predecible
  const transform = `scale(${zoom}) scaleX(${flipX ? -1 : 1}) scaleY(${
    flipY ? -1 : 1
  })`;

  return (
    <div>
      {/* IMAGEN PRINCIPAL */}
      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-lg">
        {active ? (
          // ✅ Viewport: imagen + overlay dentro, controles afuera
          <div className="relative w-full overflow-hidden">
            <div className="relative w-full">
              <img
                src={active}
                alt={productName}
                className="w-full h-auto block object-cover origin-center transition-transform duration-200 select-none pointer-events-none"
                style={{ transform }}
                loading="eager"
                draggable={false}
              />

              {/* ✅ OVERLAY de recorte */}
              <FototapetyCropOverlay
                widthCm={wClamped}
                heightCm={hClamped}
                maxPanelWidthCm={maxPanelWidthCm}
                flipX={flipX}
                flipY={flipY}
              />
            </div>
          </div>
        ) : (
          <div className="p-14 text-black/50">No image</div>
        )}
      </div>

      {/* ✅ CONTROLES DEBAJO DE LA IMAGEN (no overlay) */}
      {active ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFlipX((v) => !v)}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Odwróć w poziomie"
            title="Odwróć w poziomie"
          >
            <IconFlipX />
          </button>

          <button
            type="button"
            onClick={() => setFlipY((v) => !v)}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Odwróć w pionie"
            title="Odwróć w pionie"
          >
            <IconFlipY />
          </button>

          <button
            type="button"
            onClick={cycleZoom}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Powiększ"
            title="Powiększ"
          >
            <IconZoom />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="h-9 rounded-md px-3 bg-white border border-black/15 text-black hover:bg-black/5 transition shadow"
          >
            Reset
          </button>
        </div>
      ) : null}

      {/* THUMBS */}
      {images?.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((img: any, idx: number) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={img.id ?? `${img.src}-${idx}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={[
                  "rounded-xl overflow-hidden border bg-white",
                  isActive ? "border-[#c9b086]" : "border-black/10",
                ].join(" ")}
                title={img.alt || productName}
              >
                <img
                  src={img.src}
                  alt={img.alt || productName}
                  className="w-full h-16 block object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* BARRA INFO (Powierzchnia/Wymiary/Bryty) */}
      <div className="mt-4 rounded-xl bg-black/5 border border-black/10 px-4 py-3 text-sm text-black/90">
        <span className="font-semibold">Powierzchnia:</span>{" "}
        {areaM2.toFixed(2)} m² <span className="text-black/40">|</span>{" "}
        <span className="font-semibold">Wymiary:</span> {wClamped}x{hClamped} cm{" "}
        <span className="text-black/40">|</span>{" "}
        <span className="font-semibold">Bryty:</span> {panels.panelCount} x{" "}
        {panels.panelWidth} cm
      </div>

      {/* INPUTS */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-black/80 mb-2">
            Szerokość (cm) <span className="text-red-500">*</span>
          </label>

          <StepperInput
            value={w}
            onChange={(next) => setW(next)}
            onBlur={() => setW(wClamped)}
            min={1}
            max={maxW > 0 ? maxW : 9999}
            placeholder={String(defaultWidthCm)}
            ariaLabel="Szerokość (cm)"
          />

          <div className="mt-2 text-xs text-black/60">
            Max: {maxW > 0 ? `${maxW} cm` : "—"}
          </div>
        </div>

        <div>
          <label className="block text-sm text-black/80 mb-2">
            Wysokość (cm) <span className="text-red-500">*</span>
          </label>

          <StepperInput
            value={h}
            onChange={(next) => setH(next)}
            onBlur={() => setH(hClamped)}
            min={1}
            max={maxH > 0 ? maxH : 9999}
            placeholder={String(defaultHeightCm)}
            ariaLabel="Wysokość (cm)"
          />

          <div className="mt-2 text-xs text-black/60">
            Max: {maxH > 0 ? `${maxH} cm` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
