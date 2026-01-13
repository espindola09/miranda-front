"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  maxWidthCm: number;   // desde product.dimensions.width
  maxHeightCm: number;  // desde product.dimensions.height
  defaultWidthCm?: number;  // por defecto 70
  defaultHeightCm?: number; // por defecto 100
  maxPanelWidthCm?: number; // por defecto 100
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInt(value: string) {
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n);
}

export default function FototapetyConfigurator({
  maxWidthCm,
  maxHeightCm,
  defaultWidthCm = 70,
  defaultHeightCm = 100,
  maxPanelWidthCm = 100,
}: Props) {
  const hasMaxW = Number.isFinite(maxWidthCm) && maxWidthCm > 0;
  const hasMaxH = Number.isFinite(maxHeightCm) && maxHeightCm > 0;

  const initW = hasMaxW ? clamp(defaultWidthCm, 1, maxWidthCm) : defaultWidthCm;
  const initH = hasMaxH ? clamp(defaultHeightCm, 1, maxHeightCm) : defaultHeightCm;

  const [w, setW] = useState<number>(initW);
  const [h, setH] = useState<number>(initH);

  // Si cambian máximos (por ejemplo otro producto), re-clamp
  useEffect(() => {
    setW((prev) => (hasMaxW ? clamp(prev || initW, 1, maxWidthCm) : prev || initW));
    setH((prev) => (hasMaxH ? clamp(prev || initH, 1, maxHeightCm) : prev || initH));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWidthCm, maxHeightCm]);

  const areaM2 = useMemo(() => {
    const val = (w * h) / 10000;
    // 2 decimales como en Woo
    return Number.isFinite(val) ? val.toFixed(2) : "0.00";
  }, [w, h]);

  const panelsInfo = useMemo(() => {
    // Regla: paneles por ancho, maxPanelWidthCm
    const panels = Math.max(1, Math.ceil(w / maxPanelWidthCm));
    const panelWidth = Math.max(1, Math.round(w / panels));
    return { panels, panelWidth };
  }, [w, maxPanelWidthCm]);

  const handleBlurWidth = (raw: string) => {
    const n = toInt(raw);
    if (!Number.isFinite(n) || n <= 0) {
      setW(initW);
      return;
    }
    setW(hasMaxW ? clamp(n, 1, maxWidthCm) : Math.max(1, n));
  };

  const handleBlurHeight = (raw: string) => {
    const n = toInt(raw);
    if (!Number.isFinite(n) || n <= 0) {
      setH(initH);
      return;
    }
    setH(hasMaxH ? clamp(n, 1, maxHeightCm) : Math.max(1, n));
  };

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Szerokość */}
        <div>
          <label className="block text-xs text-white/70 mb-2">
            Szerokość (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
            defaultValue={w}
            min={1}
            max={hasMaxW ? maxWidthCm : undefined}
            onBlur={(e) => handleBlurWidth(e.target.value)}
          />
          <div className="mt-2 text-xs text-white/60">
            {hasMaxW ? <>Max: {maxWidthCm} cm</> : <>&nbsp;</>}
          </div>
        </div>

        {/* Wysokość */}
        <div>
          <label className="block text-xs text-white/70 mb-2">
            Wysokość (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
            defaultValue={h}
            min={1}
            max={hasMaxH ? maxHeightCm : undefined}
            onBlur={(e) => handleBlurHeight(e.target.value)}
          />
          <div className="mt-2 text-xs text-white/60">
            {hasMaxH ? <>Max: {maxHeightCm} cm</> : <>&nbsp;</>}
          </div>
        </div>
      </div>

      {/* Barra gris tipo WP */}
      <div className="mt-6 rounded-md bg-white text-black px-4 py-3 text-sm font-semibold">
        <span>Powierzchnia: {areaM2} m²</span>
        <span className="mx-2">|</span>
        <span>Wymiary: {w}x{h} cm</span>
        <span className="mx-2">|</span>
        <span>Bryty: {panelsInfo.panels} x {panelsInfo.panelWidth} cm</span>
      </div>
    </section>
  );
}
